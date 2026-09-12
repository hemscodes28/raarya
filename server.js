
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { propertyRepo } from './server/propertyRepository.js';
import { websiteSearchService } from './server/websiteSearch.js';
import { detectIntentAndExtractFilters } from './server/intentDetector.js';
import { conversationManager } from './server/conversationManager.js';
import { geminiService } from './server/geminiService.js';
import { chatController } from './server/controllers/chatController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env file to load variables on server startup
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let val = trimmed.substring(index + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
    console.log('Loaded variables from .env file successfully!');
  }
} catch (err) {
  console.error('Error loading .env file manually:', err);
}

const app = express();
const PORT = process.env.PORT || 5000;

// OTP temporary store (phone -> { otp, expiresAt })
const pendingOtps = new Map();

const DB_FILE = path.join(__dirname, 'user_database.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = { users: [], history: [], properties: [], enquiries: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(data || '{"users":[],"history":[],"properties":[],"enquiries":[]}');
    if (!db.properties) db.properties = [];
    if (!db.enquiries) db.enquiries = [];
    return db;
  } catch (err) {
    console.error("Error reading database:", err);
    return { users: [], history: [], properties: [], enquiries: [] };
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// ─── AI CHATBOT PROPERTY SEARCH SYSTEM ────────────────────────────────────────
let allProperties = [];

function loadAllProperties() {
  try {
    // 1. Load from user_database.json
    const db = readDatabase();
    const dbProps = db.properties || [];
    
    // 2. Load from src/data/extracted_properties.json
    const extractedPath = path.join(__dirname, 'src', 'data', 'extracted_properties.json');
    let extractedProps = [];
    if (fs.existsSync(extractedPath)) {
      const data = fs.readFileSync(extractedPath, 'utf8');
      extractedProps = JSON.parse(data || '[]');
    } else {
      const fallbackPath = path.join(__dirname, 'data', 'extracted_properties.json');
      if (fs.existsSync(fallbackPath)) {
        const data = fs.readFileSync(fallbackPath, 'utf8');
        extractedProps = JSON.parse(data || '[]');
      }
    }
    
    // Combine and deduplicate
    const combined = [...dbProps, ...extractedProps];
    const seen = new Set();
    allProperties = combined.filter(p => {
      if (!p || !p.id) return false;
      const duplicate = seen.has(p.id);
      seen.add(p.id);
      return !duplicate;
    });
    console.log(`Loaded ${allProperties.length} total properties for AI search!`);
  } catch (err) {
    console.error("Error loading properties for AI search:", err);
    allProperties = [];
  }
}

// Initial load on server startup
loadAllProperties();

function searchProperties(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  
  // Return empty if it's a simple greeting so Gemini gives a warm welcome without irrelevant property list
  if (/^(hi+|hello|hey|namaste|good\s*(morning|afternoon|evening)|greetings|howdy)[\s!.]*$/i.test(q)) {
    return [];
  }

  // Try to find if user is looking for rent vs buy vs pg
  let targetType = null;
  if (q.includes('rent') || q.includes('lease') || q.includes('for rent') || q.includes('rental')) targetType = 'rent';
  else if (q.includes('pg') || q.includes('hostel') || q.includes('paying guest') || q.includes('room')) targetType = 'pg-hostel';
  else if (q.includes('buy') || q.includes('sell') || q.includes('sale') || q.includes('plot') || q.includes('villa') || q.includes('land') || q.includes('purchase')) targetType = 'buy';

  // Comprehensive Coimbatore & Western TN locations
  const locations = [
    'singanallur', 'sulur', 'ondipudur', 'peelamedu', 'gandhipuram', 'vadamadurai', 
    'thudiyalur', 'hopes', 'ramanathapuram', 'saibaba colony', 'ganapathy', 'saravanampatti', 
    'annur', 'kinathukadavu', 'karumathampatti', 'sirumugai', 'thekkalur', 'coimbatore', 
    'avinashi', 'kaniyur', 'kovaipudur', 'kurumbapalayam', 'kalapatti', 'tidel park'
  ];
  let matchedLocations = locations.filter(loc => q.includes(loc));

  // Extract price conditions (e.g. "under 10 lakhs" -> maxPrice = 1000000)
  let maxPrice = null;
  const lakhMatch = q.match(/(?:under|below|less\s+than|max|budget)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lacs|lac)/i);
  if (lakhMatch) {
    maxPrice = parseFloat(lakhMatch[1]) * 100000;
  }
  const crMatch = q.match(/(?:under|below|less\s+than|max|budget)\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)/i);
  if (crMatch) {
    maxPrice = parseFloat(crMatch[1]) * 10000000;
  }

  // Filter properties
  let results = allProperties;
  if (targetType) {
    results = results.filter(p => p.type === targetType);
  }

  // Strict location filtering if user specifically mentioned a location like Singanallur
  if (matchedLocations.length > 0) {
    // Exclude general "coimbatore" if more specific location like "singanallur" is present
    const specificLocations = matchedLocations.filter(l => l !== 'coimbatore');
    const targetLocs = specificLocations.length > 0 ? specificLocations : matchedLocations;
    
    results = results.filter(p => targetLocs.some(loc => {
      const locationMatch = p.location?.toLowerCase().includes(loc);
      const titleMatch = p.title?.toLowerCase().includes(loc);
      return locationMatch || titleMatch;
    }));
  }
  
  // Score and sort properties
  const scored = results.map(p => {
    let score = 0;
    const title = p.title?.toLowerCase() || '';
    const loc = p.location?.toLowerCase() || '';
    const desc = p.description?.toLowerCase() || '';
    
    // Match exact query words (removing hyphens, commas, symbols)
    const cleanWords = q.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'are', 'you', 'with', 'in', 'property', 'properties', 'plots', 'plot', 'show', 'give', 'need', 'want', 'list', 'details'].includes(w));
    
    cleanWords.forEach(word => {
      if (title.includes(word)) score += 8;
      if (loc.includes(word)) score += 5;
      if (desc.includes(word)) score += 2;
    });
    
    // Extra boost if full clean phrase is in title or location
    const cleanPhrase = cleanWords.join(' ');
    if (cleanPhrase.length > 3) {
      if (title.includes(cleanPhrase)) score += 20;
      if (loc.includes(cleanPhrase)) score += 15;
    }
    
    // Filter by price if requested
    if (maxPrice) {
      const numericPrice = parseInt(p.price?.replace(/[^\d]/g, '') || '0');
      if (numericPrice > 0) {
        if (numericPrice <= maxPrice) {
          score += 10;
        } else {
          score -= 15; // penalize properties exceeding budget
        }
      }
    }

    return { property: p, score };
  });

  // Sort by score descending and return up to 15 properties
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.property)
    .slice(0, 15);
}


// ─── SIGNUP ───────────────────────────────────────────────────────────────────
app.post('/api/signup', (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !password)
    return res.status(400).json({ success: false, message: 'Name, Phone, and Password are required.' });

  const db = readDatabase();
  
  // Check unique phone number
  const existingPhone = db.users.find(u => u.phone === phone);
  if (existingPhone) {
    db.history.unshift({
      id: 'log_' + Date.now(),
      name, email: email || 'No Email', action: 'signup', status: 'failure', message: 'Phone number already registered',
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || '127.0.0.1'
    });
    writeDatabase(db);
    return res.status(400).json({ success: false, message: 'Phone number is already registered.' });
  }

  // Check unique email (if email is provided)
  if (email) {
    const existingEmail = db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      db.history.unshift({
        id: 'log_' + Date.now(),
        name, email, action: 'signup', status: 'failure', message: 'Email already registered',
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || '127.0.0.1'
      });
      writeDatabase(db);
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }
  }

  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name, email: email || '', password, phone, whatsapp: '', avatarColor: '#141414',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  db.history.unshift({
    id: 'log_' + Date.now(),
    name, email: email || 'No Email', action: 'signup', status: 'success',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || '127.0.0.1'
  });
  writeDatabase(db);
  res.status(201).json({ success: true, message: 'Signup successful!', user: { name, email: newUser.email, phone, whatsapp: '', avatar: '' } });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password)
    return res.status(400).json({ success: false, message: 'Phone/Email and password are required.' });

  const db = readDatabase();
  const target = phone.trim().toLowerCase();
  const user = db.users.find(u => (u.phone && u.phone.trim() === target) || (u.email && u.email.trim().toLowerCase() === target));

  if (!user || user.password !== password) {
    db.history.unshift({
      id: 'log_' + Date.now(),
      name: user ? user.name : 'Unknown User', email: user ? user.email : 'No Email', action: 'login', status: 'failure',
      message: !user ? 'User not found' : 'Incorrect password',
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || '127.0.0.1'
    });
    writeDatabase(db);
    return res.status(401).json({ success: false, message: 'Invalid credentials or password.' });
  }

  db.history.unshift({
    id: 'log_' + Date.now(),
    name: user.name, email: user.email || 'No Email', action: 'login', status: 'success',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || '127.0.0.1'
  });
  writeDatabase(db);
  res.status(200).json({
    success: true, message: 'Login successful!',
    user: { name: user.name, email: user.email || '', phone: user.phone || '', whatsapp: user.whatsapp || '', avatar: user.avatar || '' }
  });
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
app.put('/api/profile', (req, res) => {
  const { email, name, phone, whatsapp, avatar } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  const db = readDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (whatsapp !== undefined) user.whatsapp = whatsapp;
  if (avatar !== undefined) user.avatar = avatar;

  writeDatabase(db);
  res.json({
    success: true, message: 'Profile updated successfully.',
    user: { name: user.name, email: user.email, phone: user.phone, whatsapp: user.whatsapp, avatar: user.avatar || '' }
  });
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
app.put('/api/change-password', (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  const db = readDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.password !== oldPassword)
    return res.status(401).json({ success: false, message: 'Old password is incorrect.' });

  user.password = newPassword;
  writeDatabase(db);
  res.json({ success: true, message: 'Password changed successfully.' });
});

// ─── ADD PROPERTY ─────────────────────────────────────────────────────────────
app.post('/api/properties', (req, res) => {
  const { userEmail, ...propertyData } = req.body;
  if (!userEmail) return res.status(400).json({ success: false, message: 'User email required.' });

  const db = readDatabase();
  const property = {
    id: 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    userEmail, ...propertyData,
    status: 'Pending', sold: false,
    createdAt: new Date().toISOString()
  };
  db.properties.push(property);
  writeDatabase(db);
  loadAllProperties();
  res.status(201).json({ success: true, message: 'Property listed successfully!', property });
});

// ─── GET USER PROPERTIES ──────────────────────────────────────────────────────
app.get('/api/properties/:email', (req, res) => {
  const { email } = req.params;
  const db = readDatabase();
  const props = db.properties.filter(p => p.userEmail?.toLowerCase() === email.toLowerCase());
  res.json({ success: true, properties: props });
});

// ─── GET ENQUIRIES ────────────────────────────────────────────────────────────
app.get('/api/enquiries/:email', (req, res) => {
  const { email } = req.params;
  const db = readDatabase();
  const enquiries = db.enquiries.filter(e => e.ownerEmail?.toLowerCase() === email.toLowerCase());
  res.json({ success: true, enquiries });
});

// ─── HISTORY (for company portal) ────────────────────────────────────────────
app.get('/api/history', (req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    usersCount: db.users.length,
    historyCount: db.history.length,
    users: db.users.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, whatsapp: u.whatsapp, createdAt: u.createdAt })),
    history: db.history,
    propertiesCount: db.properties.length,
    properties: db.properties
  });
});

// ─── EMAIL OTP DISPATCHER (NODEMAILER) ──────────────────────────────────────────
async function sendEmailOtp(email, otp) {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'raaryagroups@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'hbtpxiotrupxdsoe';

  try {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;

    const transporter = nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port: port,
      secure: port === 465,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"RAARYA Groups" <${smtpUser}>`,
      to: email,
      subject: `Your RAARYA Security Code is ${otp}`,
      text: `Hello,\n\nYour RAARYA verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\n© 2026 Raarya Groups & Properties.`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0c0c0e; color: #ffffff; padding: 32px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.12);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #fbbf24; margin: 0; font-size: 26px; font-weight: bold; tracking-wide: 2px;">RAARYA GROUPS</h2>
            <p style="color: #a1a1aa; font-size: 13px; margin-top: 6px;">Account Security Verification</p>
          </div>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px;" />
          <p style="font-size: 15px; line-height: 1.6; color: #e4e4e7;">
            Hello,
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #e4e4e7;">
            Your security verification code to access your RAARYA account is:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #fbbf24; background: rgba(251,191,36,0.12); padding: 14px 28px; border-radius: 14px; border: 1px dashed rgba(251,191,36,0.4); display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #a1a1aa; text-align: center; margin-top: 24px;">
            This security code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 24px; margin-bottom: 16px;" />
          <p style="font-size: 11px; color: #71717a; text-align: center; margin: 0;">
            © 2026 Raarya Groups & Properties. All rights reserved.
          </p>
        </div>
      `,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Sent real OTP email to ${email} (MessageId: ${info.messageId})`);
    return { success: true, isMocked: false };
  } catch (err) {
    console.error('[Nodemailer error]:', err.message);
    return { success: true, isMocked: true, otp, error: err.message };
  }
}

// ─── FAST2SMS SENDER HELPER ────────────────────────────────────────────────────
async function sendFast2Sms(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const isMock = !apiKey || process.env.VITE_MOCK_SMS === 'true';
  if (isMock) {
    console.log(`
    ======================================================
    [INFO] SMS Simulation active. Code generated: ${otp}
    ======================================================
    `);
    return { return: true, isMocked: true, otp };
  }

  const cleanedPhone = phone.replace(/\D/g, '').slice(-10);

  try {
    // Attempt 1: OTP Route
    const otpUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&numbers=${cleanedPhone}&flash=0`;
    let response = await fetch(otpUrl);
    let result = await response.json();
    console.log('[Fast2SMS OTP Route Response]:', result);

    if (result && (result.return === true || result.status_code === 200)) {
      return { return: true, result };
    }

    // Attempt 2: Quick SMS Route
    const msgText = encodeURIComponent(`Your RAARYA verification code is: ${otp}`);
    const qUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=q&message=${msgText}&language=english&flash=0&numbers=${cleanedPhone}`;
    response = await fetch(qUrl);
    result = await response.json();
    console.log('[Fast2SMS Quick Route Response]:', result);

    if (result && (result.return === true || result.status_code === 200)) {
      return { return: true, result };
    }

    console.warn('[Fast2SMS API Note]:', result.message || 'SMS dispatched');
    return { return: true, isMocked: false, result };
  } catch (err) {
    console.error('[Fast2SMS error]:', err);
    return { return: true, isMocked: true, otp };
  }
}

// ─── SEND OTP ──────────────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { phone, email } = req.body;
  if (!phone && !email) return res.status(400).json({ success: false, message: 'Phone number or email required.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const targetKey = (email || phone).toLowerCase().trim();

  pendingOtps.set(targetKey, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  let emailResult = null;
  if (email) {
    emailResult = await sendEmailOtp(email, otp);
  }

  let smsResult = null;
  if (phone) {
    smsResult = await sendFast2Sms(phone, otp);
  }

  if (email) {
    if (emailResult && emailResult.isMocked) {
      return res.json({ 
        success: true, 
        isMocked: true, 
        otp, 
        message: `OTP code generated for ${email}. (Set SMTP_PASS in .env for inbox delivery)` 
      });
    }
    return res.json({ 
      success: true, 
      isMocked: false,
      message: `Verification code sent to email: ${email}` 
    });
  }

  if (smsResult && smsResult.isMocked) {
    return res.json({ 
      success: true, 
      isMocked: true, 
      otp: smsResult.otp, 
      message: 'Verification code generated (on-screen).' 
    });
  }

  res.json({ 
    success: true, 
    isMocked: false,
    message: 'Verification code sent to your phone number.' 
  });
});

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
app.post('/api/verify-otp', (req, res) => {
  const { phone, email, otp } = req.body;
  if ((!phone && !email) || !otp) return res.status(400).json({ success: false, message: 'Phone/Email and OTP are required.' });

  const targetKey = (email || phone).toLowerCase().trim();
  const record = pendingOtps.get(targetKey);
  if (!record) return res.status(400).json({ success: false, message: 'No OTP generated for this address.' });

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(targetKey);
    return res.status(400).json({ success: false, message: 'OTP code has expired.' });
  }

  if (record.otp === otp) {
    pendingOtps.delete(targetKey);
    return res.json({ success: true, message: 'OTP verified successfully.' });
  } else {
    return res.status(400).json({ success: false, message: 'Incorrect OTP code.' });
  }
});

// ─── FORGOT PASSWORD (EMAIL DISPATCH) ───────────────────────────────────────
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email address is required.' });

  const db = readDatabase();
  const user = db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOtps.set(`reset_${email.toLowerCase().trim()}`, { otp: resetCode, expiresAt: Date.now() + 15 * 60 * 1000 });

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'raaryagroups@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });
      await transporter.sendMail({
        from: `"RAARYA Groups Support" <${smtpUser}>`,
        to: email,
        subject: 'RAARYA Account Password Reset Instructions',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0c0c0e; color: #ffffff; padding: 32px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.12);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #fbbf24; margin: 0; font-size: 26px; font-weight: bold;">RAARYA GROUPS</h2>
              <p style="color: #a1a1aa; font-size: 13px; margin-top: 6px;">Password Reset Request</p>
            </div>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px;" />
            <p style="font-size: 15px; line-height: 1.6; color: #e4e4e7;">
              Hello${user ? ' ' + user.name : ''},
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #e4e4e7;">
              We received a request to reset the password for your RAARYA account. Your security code is:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #fbbf24; background: rgba(251,191,36,0.12); padding: 14px 28px; border-radius: 14px; border: 1px dashed rgba(251,191,36,0.4); display: inline-block;">
                ${resetCode}
              </span>
            </div>
            <p style="font-size: 13px; color: #a1a1aa; text-align: center; margin-top: 24px;">
              This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.
            </p>
          </div>
        `
      });
      console.log(`[Nodemailer] Sent password reset code to ${email}`);
    } catch (e) {
      console.error("[Nodemailer] Password reset email error:", e.message);
    }
  }

  res.json({
    success: true,
    message: `Password reset instructions sent to ${email}. Please check your inbox!`
  });
});

// ─── RESET PASSWORD (WITH 6-DIGIT EMAIL CODE) ──────────────────────────────────
app.post('/api/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, reset code, and new password are required.' });
  }

  const targetKey = `reset_${email.toLowerCase().trim()}`;
  const record = pendingOtps.get(targetKey);

  if (!record) {
    return res.status(400).json({ success: false, message: 'Reset code expired or not requested. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(targetKey);
    return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new code.' });
  }

  if (record.otp === code.trim()) {
    pendingOtps.delete(targetKey);

    const db = readDatabase();
    const userIndex = db.users.findIndex(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
    
    if (userIndex !== -1) {
      db.users[userIndex].password = newPassword;
      writeDatabase(db);
    }

    return res.json({ success: true, message: 'Password updated successfully! You can now login with your new password.' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid reset code. Please check your email inbox.' });
  }
});


// ─── GENERAL CONTACT INQUIRY ──────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Name, Email, Phone, and Message are all required.' });
  }

  const db = readDatabase();
  if (!db.enquiries) db.enquiries = [];
  
  const newEnquiry = {
    id: 'enq_contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    ownerEmail: 'raaryagroupsinfo@gmail.com',
    propertyName: 'General Contact Inquiry',
    name,
    mobile: phone,
    email,
    message,
    type: 'general_contact',
    createdAt: new Date().toISOString()
  };

  db.enquiries.push(newEnquiry);
  
  if (!db.history) db.history = [];
  db.history.unshift({
    id: 'log_' + Date.now(),
    name,
    email,
    action: 'contact_inquiry',
    status: 'success',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || '127.0.0.1'
  });

  writeDatabase(db);
  res.status(201).json({ success: true, message: 'Contact message received successfully!', enquiry: newEnquiry });
});

// ─── AI CHATBOT API ENDPOINT ──────────────────────────────────────────────────
app.post('/api/chat', (req, res) => chatController.handleChatRequest(req, res));

// Helper function to generate high-fidelity responses in local offline mode
function getSmartFallbackResponse(userMessage, matchedProps) {
  const q = userMessage.toLowerCase().trim();

  // 0. Greeting check
  if (/^(hi+|hello|hey|namaste|good\s*(morning|afternoon|evening)|greetings|howdy)[\s!.]*$/i.test(q)) {
    return `### Hello! Welcome to Raarya Properties 👋
I am your AI Property Assistant. How can I help you find your dream plot, villa, or property in Coimbatore today?

**You can ask me:**
- "Plots in Thulir Nagar - Kittampalayam"
- "Properties in Saravanampatti under 45 Lakhs"
- "Calculate home loan EMI"
- "How to list my property"`;
  }

  // 0.5. About Company & Raarya Properties (Flexible Semantic & Pattern Matching)
  const isCompanyQuery = Boolean(
    ((q.includes('raar') || q.includes('rarya') || q.includes('raarya') || q.includes('company') || q.includes('business') || q.includes('organization') || q.includes('firm') || q.includes('platform') || q.includes('agency')) &&
     (q.includes('about') || q.includes('know') || q.includes('tell') || q.includes('info') || q.includes('detail') || q.includes('service') || q.includes('what is') || q.includes('who is') || q.includes('what does') || q.includes('what do') || q.includes('explain') || q.includes('describe') || q.includes('overview') || q.includes('summary') || q.includes('background') || q.includes('history') || q.includes('kind') || q.includes('type') || q.includes('nature') || q.includes('profile') || q.includes('mission') || q.includes('vision')) &&
     !(q.includes('bhk') || q.includes('bedroom') || q.includes('lakh') || q.includes('lac') || q.includes('crore') || q.includes('under') || q.includes('below') || q.includes('cheap') || q.includes('villa') || q.includes('apartment') || q.includes('plot') || q.includes('land') || q.includes('house'))) ||
    q.includes('about us') ||
    q.includes('about company') ||
    q.includes('about the company') ||
    q.includes('about this company') ||
    q.includes('about raarya') ||
    q.includes('know about') ||
    q.includes('tell about') ||
    q.includes('info about') ||
    q.includes('information about') ||
    q.includes('details of company') ||
    q.includes('details about') ||
    q.includes('what is raarya') ||
    q.includes('who is raarya') ||
    q.includes('what does raarya') ||
    q.includes('what do you do') ||
    q.includes('what is this company') ||
    q.includes('what kind of company') ||
    q.includes('what type of company') ||
    q.includes('company info') ||
    q.includes('company details') ||
    q.includes('company profile') ||
    q.includes('company overview')
  );

  if (isCompanyQuery) {
    return `### 🏠 About Raarya Properties

Raarya Properties is a premier real estate platform based in Coimbatore, Tamil Nadu. We specialize in verified DTCP & RERA approved layout plots, luxury villas, independent houses, commercial land, and student PG/hostels.

**Services Offered by Raarya:**
- **Plot & Villa Sales**: DTCP & RERA approved layout plots and luxury villas across key Coimbatore corridors.
- **Free Property Listing**: List your land, house, or commercial space for free to reach thousands of active buyers.
- **Home Loan Assistance**: Up to 90% bank funding with partner banks (HDFC, SBI, ICICI, Axis Bank) starting from 8.5% interest rate.
- **Interactive Tools**: Online EMI Calculator and Home Loan Eligibility Checker.
- **Assisted Site Visits**: Free accompanied site visits with complete legal title inspection.

📍 **Head Office Address**: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037, Tamil Nadu, India.
📞 **Phone**: **+91 90872 40400**
✉️ **Email**: **raaryagroupsinfo@gmail.com**
⏰ **Working Hours**: Monday to Saturday, 9:00 AM to 7:00 PM.`;
  }

  // 1. If property search produced matches from database, return them immediately!
  if (matchedProps && matchedProps.length > 0) {
    const list = matchedProps.slice(0, 12).map((p, i) => {
      return `${i + 1}. **${p.title}**
   - **Price**: ${p.price} | **Type**: ${p.type === 'buy' ? 'For Sale' : p.type === 'rent' ? 'For Rent' : 'PG / Hostel'}
   - **Location**: ${p.location}
   - **Extent**: ${p.areaDisplay || p.overviewDetails?.Area || (p.area ? p.area + ' sq.ft' : 'Verified Extent')}
   - **Agent**: ${p.agentName || 'Rajkumar'} (${p.agentPhone || '9087240400'})
   - [Click to View Details](#buy)`;
    }).join('\n\n');

    return `🔍 **Verified Properties Matching Your Query**

Here are curated property listings from **Raarya Properties**:

${list}

✅ **All Raarya layout plots are 100% DTCP & RERA approved with clear legal titles.**

📞 **Book a Free Site Visit**: Call **+91 90872 40400** or [Send an Enquiry](#contact).`;
  }

  // 2. Home Loan / Financial / Eligibility Queries
  if (
    q.includes('loan') ||
    q.includes('emi') ||
    q.includes('calculator') ||
    q.includes('interest') ||
    q.includes('mortgage') ||
    q.includes('bank') ||
    q.includes('eligibility') ||
    q.includes('eligible') ||
    q.includes('finance')
  ) {
    return `### Home Loan Eligibility & EMI Calculator
Raarya Properties helps secure home loans through partnered top banks. 

**What we offer:**
- **Interest Rates**: Starting from **8.5% p.a.**
- **Funding Limit**: Up to **90% bank funding** on DTCP/RERA layout plots & villas
- **Eligible Profiles**: Salaried professionals & Self-employed business owners (Age 21-65)
- **Partner Banks**: HDFC Bank, SBI, ICICI Bank, Axis Bank

You can check your eligibility and calculate your monthly EMI directly on our [#home-loan](#home-loan) section. Call **+91 90872 40400** for immediate bank assistance!`;
  }

  // 3. Careers & Openings
  if (q.includes('career') || q.includes('job') || q.includes('hiring') || q.includes('vacancy') || q.includes('work') || q.includes('apply')) {
    return `### Careers at Raarya Properties
Join a team building the next standard for luxury real estate discovery in Coimbatore! We are hiring for:

1. **Senior Real Estate Advisor** (High-end plot & villa sales)
2. **Site Marketing Executive** (Lead generation & site visits)
3. **Property Verification Executive** (DTCP & legal paperwork)

Email your resume to **raaryagroupsinfo@gmail.com** or read more on our [#careers](#careers) page.`;
  }

  // 4. List/Post Property (Strict check so "list the properties in annur" is NOT hijacked)
  if (
    q.includes('how to list') ||
    q.includes('post my property') ||
    q.includes('add my property') ||
    q.includes('sell my property') ||
    q.includes('register my property') ||
    q.includes('list my property')
  ) {
    return `### List Your Property on Raarya
You can advertise your villa, apartment, or residential plot on our platform to reach thousands of buyers:

**How to get started:**
1. Click [#login](#login) to create or log in to your account.
2. Verify your phone number with our secure OTP verification.
3. Navigate to your user profile dashboard and select **Add Property**.
4. Input details (photos, amenities, location) and submit!

Go to [#post-property](#post-property) to start.`;
  }

  // 5. Contact Details
  if (q.includes('contact') || q.includes('phone') || q.includes('mobile') || q.includes('email') || q.includes('address') || q.includes('call') || q.includes('number') || q.includes('office') || q.includes('support')) {
    return `### Contact Raarya Properties
Feel free to reach out to our official team directly:

- 📞 **Phone**: +91 90872 40400 (Mon-Sat, 9:00 AM - 7:00 PM)
- ✉️ **Email**: raaryagroupsinfo@gmail.com
- 📍 **Head Office**: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037, Tamil Nadu, India.
- 💬 **Inquiry Form**: You can submit a message on our [#contact](#contact) page.`;
  }

  // 6. About Company / Vision
  if (q.includes('about') || q.includes('company') || q.includes('who') || q.includes('raarya') || q.includes('vision') || q.includes('approach') || q.includes('services')) {
    return `### About Raarya Properties
Raarya Properties connects buyers and investors with prime residential plots, villas, and hostels in Coimbatore. 

**Our Approach:**
- **Local Intelligence**: Advisors with deep insights into high-growth corridors (like Saravanampatti and Annur).
- **Digital Walk-throughs**: Clear digital walkthroughs and verified papers before site visits.
- **Investment Discipline**: Helping you find lands with clear DTCP/RERA approvals for high appreciation.

📍 **Head Office**: 2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037, Tamil Nadu
📞 **Phone**: +91 90872 40400
⏰ **Working Hours**: Monday to Saturday, 9:00 AM to 7:00 PM`;
  }

  // Default response when 0 properties or general query
  return `### Raarya Properties Support
We currently do not have verified property listings matching your exact request in our active portfolio. We specialize in high-growth corridors across Coimbatore (Saravanampatti, Annur, Kittampalayam, Singanallur, Karumathampatti, Mettupalayam, Avinashi Road).

**Need help?**
- Call our team at **+91 90872 40400** (Mon-Sat, 9:00 AM - 7:00 PM)
- Email us at **raaryagroupsinfo@gmail.com**
- Visit our office at **2D, A-Block, Ram Apartment, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037**`;
}

app.listen(PORT, () => {
  console.log(`Zenith Realty Backend Server running on http://localhost:${PORT}`);
});
