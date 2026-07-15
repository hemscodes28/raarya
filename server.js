
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
    return res.status(400).json({ success: false, message: 'Phone and password are required.' });

  const db = readDatabase();
  const user = db.users.find(u => u.phone === phone);

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
    return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
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
    user: { name: user.name, email: user.email || '', phone: user.phone, whatsapp: user.whatsapp || '', avatar: user.avatar || '' }
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

// ─── FAST2SMS SENDER HELPER ────────────────────────────────────────────────────
async function sendFast2Sms(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const isMock = !apiKey || process.env.VITE_MOCK_SMS === 'true';
  if (isMock) {
    console.log(`
    ======================================================
    [WARNING] Fast2SMS SMS Simulation active.
    Mock verification code generated: ${otp}
    ======================================================
    `);
    return { return: true, isMocked: true, otp };
  }

  const cleanedPhone = phone.replace(/\D/g, '').slice(-10);

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message: `Raarya Groups: ${otp}`,
        numbers: cleanedPhone
      })
    });

    const result = await response.json();
    console.log('[Fast2SMS API Response]:', result);
    return result;
  } catch (err) {
    console.error('[Fast2SMS error]:', err);
    return { return: false, message: 'Failed to connect to Fast2SMS API.' };
  }
}

// ─── SEND OTP ──────────────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number required.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOtps.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  const smsResult = await sendFast2Sms(phone, otp);

  // If Fast2SMS was active, return success without revealing the OTP.
  // If we are in mock mode (no key), we return isMocked = true and the OTP so local browser testing continues smoothly!
  if (smsResult.isMocked) {
    return res.json({ 
      success: true, 
      isMocked: true, 
      otp: smsResult.otp, 
      message: 'Verification code simulated (on-screen).' 
    });
  }

  res.json({ 
    success: smsResult.return, 
    isMocked: false,
    message: smsResult.return ? 'Verification code sent to your phone number.' : 'Failed to send SMS code. Check server configuration.' 
  });
});

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });

  const record = pendingOtps.get(phone);
  if (!record) return res.status(400).json({ success: false, message: 'No OTP generated for this phone number.' });

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(phone);
    return res.status(400).json({ success: false, message: 'OTP code has expired.' });
  }

  if (record.otp === otp) {
    pendingOtps.delete(phone);
    return res.json({ success: true, message: 'OTP verified.' });
  } else {
    return res.status(400).json({ success: false, message: 'Incorrect OTP code.' });
  }
});

app.listen(PORT, () => {
  console.log(`Zenith Realty Backend Server running on http://localhost:${PORT}`);
});
