import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
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

app.listen(PORT, () => {
  console.log(`Zenith Realty Backend Server running on http://localhost:${PORT}`);
});
