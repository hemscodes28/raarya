import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// OTP temporary store (email -> { otp, expiresAt })
const pendingOtps = new Map();

// Configure Mail Transporter
const mailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};
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

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  const db = readDatabase();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
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

  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name, email, password, phone: '', whatsapp: '', avatarColor: '#141414',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  db.history.unshift({
    id: 'log_' + Date.now(),
    name, email, action: 'signup', status: 'success',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || '127.0.0.1'
  });
  writeDatabase(db);
  res.status(201).json({ success: true, message: 'Signup successful!', user: { name, email, phone: '', whatsapp: '', avatar: '' } });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });

  const db = readDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    db.history.unshift({
      id: 'log_' + Date.now(),
      name: user ? user.name : 'Unknown User', email, action: 'login', status: 'failure',
      message: !user ? 'User not found' : 'Incorrect password',
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || '127.0.0.1'
    });
    writeDatabase(db);
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  db.history.unshift({
    id: 'log_' + Date.now(),
    name: user.name, email: user.email, action: 'login', status: 'success',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ipAddress: req.ip || '127.0.0.1'
  });
  writeDatabase(db);
  res.status(200).json({
    success: true, message: 'Login successful!',
    user: { name: user.name, email: user.email, phone: user.phone || '', whatsapp: user.whatsapp || '', avatar: user.avatar || '' }
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

// ─── SEND OTP ──────────────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOtps.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  console.log(`[SECURITY] Generated OTP for ${email}: ${otp}`);

  // Check if SMTP user/pass is set in .env
  if (mailConfig.auth.user && mailConfig.auth.pass) {
    try {
      const transporter = nodemailer.createTransport(mailConfig);
      await transporter.sendMail({
        from: `"Raarya Groups Security" <${mailConfig.auth.user}>`,
        to: email,
        subject: 'Raarya Groups - Verification Code',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e4e4e7; border-radius: 20px; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.02);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #a1a1aa; border: 1px solid #e4e4e7; padding: 6px 12px; border-radius: 99px; background: #fafafa;">Raarya Groups</span>
            </div>
            <h2 style="color: #18181b; font-size: 20px; font-weight: 700; text-align: center; margin-top: 0; margin-bottom: 8px;">Two-Factor Authentication</h2>
            <p style="color: #71717a; font-size: 13px; text-align: center; line-height: 1.5; margin-bottom: 24px;">Please enter the following verification code to unlock your Zenith Realty portal access.</p>
            <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; padding: 18px; border-radius: 14px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #18181b; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #a1a1aa; font-size: 11px; text-align: center; line-height: 1.5; margin-top: 24px;">This security code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
            <div style="border-top: 1px solid #f4f4f5; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #71717a; font-size: 12px; margin: 0;">Best regards,</p>
              <p style="color: #18181b; font-size: 13px; font-weight: 600; margin: 4px 0 0 0;">Raarya Groups Security Team</p>
            </div>
          </div>
        `
      });
      return res.json({ success: true, message: 'Verification code sent to your email.' });
    } catch (err) {
      console.error('SMTP Email sending error:', err);
      return res.status(500).json({ success: false, message: 'SMTP error sending email.' });
    }
  } else {
    // Falls back to terminal logging if SMTP is not yet set up
    console.log(`[DEV ALERT] SMTP keys missing in .env. Logging OTP to console: ${otp}`);
    return res.json({ success: true, isMocked: true, otp, message: 'Dev Mode: OTP logged to server terminal console.' });
  }
});

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

  const record = pendingOtps.get(email.toLowerCase());
  if (!record) return res.status(400).json({ success: false, message: 'No OTP generated for this email.' });

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(email.toLowerCase());
    return res.status(400).json({ success: false, message: 'OTP code has expired.' });
  }

  if (record.otp === otp) {
    pendingOtps.delete(email.toLowerCase());
    return res.json({ success: true, message: 'OTP verified.' });
  } else {
    return res.status(400).json({ success: false, message: 'Incorrect OTP code.' });
  }
});

app.listen(PORT, () => {
  console.log(`Zenith Realty Backend Server running on http://localhost:${PORT}`);
});
