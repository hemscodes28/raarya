
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
  const q = query.toLowerCase();
  
  // Try to find if user is looking for rent vs buy vs pg
  let targetType = null;
  if (q.includes('rent') || q.includes('lease') || q.includes('for rent') || q.includes('rental')) targetType = 'rent';
  else if (q.includes('pg') || q.includes('hostel') || q.includes('paying guest') || q.includes('room')) targetType = 'pg-hostel';
  else if (q.includes('buy') || q.includes('sell') || q.includes('sale') || q.includes('plot') || q.includes('villa') || q.includes('land') || q.includes('purchase')) targetType = 'buy';

  // Extract location terms
  const locations = ['saravanampatti', 'annur', 'kinathukadavu', 'karumathampatti', 'sirumugai', 'thekkalur', 'coimbatore', 'avinashi', 'kaniyur', 'kovaipudur', 'kurumbapalayam'];
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
  if (matchedLocations.length > 0) {
    results = results.filter(p => matchedLocations.some(loc => {
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
    
    // Match exact query words
    const queryWords = q.split(/\s+/).filter(w => w.length > 2);
    queryWords.forEach(word => {
      if (title.includes(word)) score += 5;
      if (loc.includes(word)) score += 3;
      if (desc.includes(word)) score += 1;
    });
    
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

  // Sort by score descending and take top 5
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.property)
    .slice(0, 5);
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
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'Messages array is required.' });
  }

  // Get the latest user message
  const userMessage = messages[messages.length - 1]?.content || '';
  
  // Perform RAG search for relevant properties
  const matchedProps = searchProperties(userMessage);
  
  // Format the properties for system context
  let propertiesContext = "";
  if (matchedProps.length > 0) {
    propertiesContext = "\nHere are some relevant property listings found in our database that match the user's query:\n" + 
      matchedProps.map((p, idx) => {
        return `${idx + 1}. Title: ${p.title}\n   Price: ${p.price}\n   Location: ${p.location}\n   Type: ${p.type} (${p.subType || 'Plot/Villa'})\n   Area: ${p.area || p.overviewDetails?.Area || 'N/A'}\n   Description: ${p.description || 'N/A'}\n   Agent: ${p.agentName || 'Rajkumar'} (Phone: ${p.agentPhone || '7845806061'})\n   Link: ${p.link || '#'}`;
      }).join('\n\n') + "\n\n";
  } else {
    propertiesContext = "\nNo specific properties matched the user's keywords directly. Encourage them to specify a location (like Saravanampatti, Annur, Kovaipudur, Kinathukadavu) or category (buy, rent, pg) to see listings.\n";
  }

  const systemInstructions = `You are the premium, friendly AI Assistant for Raarya Properties (also known as Raarya Groups), a leading luxury real estate company based in Coimbatore, Tamil Nadu.
Your goal is to assist website visitors by answering queries about properties for sale/rent, calculate home loans, share company vision and careers, and direct them to relevant sections of the website.

COMPANY DETAILS:
- Name: Raarya Properties / Raarya Groups
- Approach: We pair local market intelligence with digital walkthroughs.
- Reach: Portfolios across premier destinations in Coimbatore (Tamil Nadu), with services expanding globally.
- Contact Phone: 9087240400
- Contact Email: raaryagroupsinfo@gmail.com
- Working Hours: Mon-Sat, 9:00 AM - 7:00 PM

NAVIGATION HASH LINKS (use these in markdown to guide users):
- To buy properties (villas & plots): [#buy](#buy) or [#properties](#properties)
- To rent houses/apartments: [#rent](#rent)
- For Student PG / Hostels: [#pg-hostel](#pg-hostel)
- For Home Loan eligibility & EMI Calculator: [#home-loan](#home-loan)
- Careers / Job vacancies: [#careers](#careers) (We are hiring for: Senior Property Advisor, VR Experience Producer, Investment Analyst)
- About company and vision: [#company](#company)
- Post a property for sale/rent: [#post-property](#post-property) (directs to user dashboard after login)
- Contact form / general query: [#contact](#contact)

${propertiesContext}
GUIDELINES:
- Be extremely polite, professional, and helpful.
- Keep responses relatively concise, focused, and well-structured. Use lists or bold text where appropriate.
- When recommending properties, ALWAYS mention their price, location, agent, and link so they can click and check them.
- If you don't know the answer, politely offer the customer support phone number (9087240400) or email (raaryagroupsinfo@gmail.com).
- ONLY discuss real estate, properties, home loans, careers at Raarya, and website services. Keep conversation strictly related to Raarya Properties.`;

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    try {
      console.log("[AI Chatbot] Using Gemini Generative API...");
      
      // Construct contents format for Gemini API
      // Translate messages array: roles 'user' -> 'user', 'model' -> 'model'
      const contents = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      // Native fetch call to Gemini 1.5 Flash API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: systemInstructions }]
          },
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Gemini API Error Response]:", errorText);
        throw new Error(`Gemini API returned status ${response.status}`);
      }
      
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I didn't receive a response from my system. How else may I assist you?";
      
      return res.json({ success: true, content: reply });
      
    } catch (err) {
      console.error("[Gemini API Integration Error]:", err);
      // Fallback to local rule-based response in case of API failure
    }
  }

  // FALLBACK: Rule-based / Keyword matcher if API Key is missing or failed
  console.log("[AI Chatbot] Using local smart offline fallback...");
  const reply = getSmartFallbackResponse(userMessage, matchedProps);
  const disclaimerNote = "\n\n*(Note: To activate full conversational AI, please set your `GEMINI_API_KEY` in the `.env` file.)*";
  res.json({ success: true, content: reply + disclaimerNote });
});

// Helper function to generate high-fidelity responses in local offline mode
function getSmartFallbackResponse(userMessage, matchedProps) {
  const q = userMessage.toLowerCase().trim();
  
  // 1. Check for specific property names in the query
  const knownProperties = [
    { name: 'avanta', title: 'Residential land in Kurumbapalayam - Avanta', detail: 'Avanta plots in Kurumbapalayam, Saravanampatti. Price: ₹ 14,50,000. Features wide access roads, clear DTCP approval, and excellent connectivity to the IT Corridor. Agent: Rajkumar (7845806061).' },
    { name: 'brahma', title: 'Residential DTCP Approved Plots in Annur | Brahma Park', detail: 'Premium Residential DTCP Approved Plots in Annur at Brahma Park. Price: ₹ 3,90,000. Superb location with rapid growth potential and gated security. Agent: Rajkumar (7845806061).' },
    { name: 'golden vista', title: 'Residential Plots in Kinathukadavu – Golden Vista', detail: 'Beautiful residential plots in Kinathukadavu at Golden Vista. Price: ₹ 5,90,000 Per Cent. Excellent environmental surroundings and clear title approvals. Agent: Rajkumar (7845806061).' },
    { name: 'vista', title: 'Residential Plots in Kinathukadavu – Golden Vista', detail: 'Beautiful residential plots in Kinathukadavu at Golden Vista. Price: ₹ 5,90,000 Per Cent. Excellent environmental surroundings and clear title approvals. Agent: Rajkumar (7845806061).' },
    { name: 'sk garden', title: 'SK Garden - Avinashi Road, Near Kaniyur Toll Gate', detail: 'SK Garden plots located on Avinashi Road near the Kaniyur Toll Gate. Price: ₹ 9,00,000. Perfect for commercial or residential builds with high appreciation rates. Agent: Rajkumar (7845806061).' },
    { name: 'thangam', title: 'Thangam | Thekkalur, Avinashi Road', detail: 'Thangam Residential Layout in Thekkalur, Avinashi Road. Price: ₹ 5,50,000 Per Cent. Highly developed neighborhood, direct road access, and clear paperwork. Agent: Ranjini (7845806061).' },
    { name: 'elite', title: 'Raarya Elite Villa Plots', detail: 'Raarya Elite Villa Plots located in Saravanampatti, Coimbatore. Price: ₹ 45,00,000. DTCP approved, ready to construct. Agent: Rajkumar (7845806061).' },
    { name: 'meadows', title: 'Raarya Green Meadows', detail: 'Raarya Green Meadows Luxury Villa located in Kovaipudur, Coimbatore. Price: ₹ 1,20,00,000. 3 BHK, fully furnished premium villa. Agent: Rajkumar (7845806061).' }
  ];

  for (const prop of knownProperties) {
    if (q.includes(prop.name)) {
      return `### Property Detail: ${prop.title}
      
${prop.detail}

Would you like me to schedule a visit or help you contact the agent? You can view all property details on the [#properties](#properties) search page.`;
    }
  }

  // 2. Location Queries
  const locations = [
    { name: 'saravanampatti', display: 'Saravanampatti' },
    { name: 'annur', display: 'Annur' },
    { name: 'kinathukadavu', display: 'Kinathukadavu' },
    { name: 'karumathampatti', display: 'Karumathampatti' },
    { name: 'thekkalur', display: 'Thekkalur' },
    { name: 'kovaipudur', display: 'Kovaipudur' },
    { name: 'kurumbapalayam', display: 'Kurumbapalayam' },
    { name: 'coimbatore', display: 'Coimbatore' }
  ];

  const matchedLoc = locations.find(loc => q.includes(loc.name));
  if (matchedLoc) {
    const locProps = allProperties.filter(p => p.location?.toLowerCase().includes(matchedLoc.name) || p.title?.toLowerCase().includes(matchedLoc.name));
    if (locProps.length > 0) {
      return `### Properties in ${matchedLoc.display}
We have ${locProps.length} premium listings available in **${matchedLoc.display}**:

` + locProps.slice(0, 3).map((p, i) => `${i + 1}. **${p.title}**
   - Price: ${p.price}
   - Type: ${p.subType || p.propertyType || 'Plot'}
   - Agent: ${p.agentName || 'Rajkumar'} (${p.agentPhone || '7845806061'})
   - View details: [#properties](#properties)`).join('\n\n') + `

You can see all of them in the [#buy](#buy) or [#properties](#properties) section.`;
    }
  }

  // 3. General Budget query
  if (q.includes('price') || q.includes('budget') || q.includes('cost') || q.includes('lakh') || q.includes('crore')) {
    if (matchedProps.length > 0) {
      return `### Filtered Properties by Budget/Cost
Based on your budget, here are the top matching listings:

` + matchedProps.map((p, i) => `${i + 1}. **${p.title}**
   - Price: ${p.price}
   - Location: ${p.location}
   - Type: ${p.type === 'buy' ? 'For Sale' : 'For Rent'}
   - Agent: ${p.agentName || 'Rajkumar'} (${p.agentPhone || '7845806061'})`).join('\n\n') + `

View the full list matching your budget criteria in the [#properties](#properties) search tab.`;
    }
  }

  // 4. Home Loan / Financial Queries
  if (q.includes('loan') || q.includes('emi') || q.includes('calculator') || q.includes('interest') || q.includes('mortgage') || q.includes('bank')) {
    return `### Home Loan & EMI Calculator
Raarya Properties helps secure home loans through partnered top banks. 

**What we offer:**
- Interest rates starting from **8.4% p.a.**
- Fast processing and minimal documentation.
- Up to **90% funding** of the property value.
- Flexible tenure options up to **30 years**.

You can check your eligibility and calculate your monthly EMI directly on our [#home-loan](#home-loan) page. Let me know if you would like an advisor to call you back for a loan query!`;
  }

  // 5. Careers & Openings
  if (q.includes('career') || q.includes('job') || q.includes('hiring') || q.includes('vacancy') || q.includes('work') || q.includes('apply')) {
    return `### Careers at Raarya Properties
Join a team building the next standard for luxury real estate discovery! We are hiring for:

1. **Senior Property Advisor**
   - Location: Los Angeles, CA
   - Requirement: 5+ years in high-end residential sales.
2. **VR Experience Producer**
   - Location: Remote
   - Requirement: Experienced in 3D walkthrough rendering.
3. **Investment Analyst**
   - Location: New York, NY
   - Requirement: Financial modeling and market analytics.

You can read role descriptions and apply directly on our [#careers](#careers) page.`;
  }

  // 6. List/Post Property
  if (q.includes('sell') || q.includes('list') || q.includes('post') || q.includes('add') || q.includes('advertise')) {
    return `### List Your Property on Raarya
You can advertise your villa, apartment, or residential plot on our platform to reach thousands of buyers:

**How to get started:**
1. Click [#login](#login) to create or log in to your account.
2. Verify your phone number with our secure OTP verification.
3. Navigate to your dashboard space and select the **Add Property** tab.
4. Input details (photos, amenities, location) and submit!

Your listing will go live after a quick validation. Go to [#post-property](#post-property) to start.`;
  }

  // 7. Contact Details
  if (q.includes('contact') || q.includes('phone') || q.includes('mobile') || q.includes('email') || q.includes('address') || q.includes('call') || q.includes('number') || q.includes('office') || q.includes('support')) {
    return `### Contact Raarya Properties
Feel free to reach out to our team directly:

- 📞 **Phone**: +91 9087240400 (Available Mon-Sat, 9:00 AM - 7:00 PM)
- ✉️ **Email**: raaryagroupsinfo@gmail.com / raaryagroups@gmail.com
- 📍 **Head Office**: Coimbatore, Tamil Nadu, India.
- 💬 **Inquiry Form**: You can submit a message on our [#contact](#contact) page, and our relationship manager will call you back within 2 hours.`;
  }

  // 8. About Company / Vision
  if (q.includes('about') || q.includes('company') || q.includes('who') || q.includes('raarya') || q.includes('vision') || q.includes('approach') || q.includes('services')) {
    return `### About Raarya Properties
Raarya Properties connects buyers and investors with prime residential plots, villas, and hostels in Coimbatore. 

**Our Approach:**
- **Local Intelligence**: Advisors with deep insights into high-growth corridors (like Saravanampatti and Annur).
- **Digital Walk-throughs**: Clear digital walkthroughs and verified papers before site visits.
- **Investment Discipline**: Helping you find lands with clear DTCP/RERA approvals for high appreciation.

Read more about our approach on the [#company](#company) page.`;
  }

  // 9. Blog / Trends
  if (q.includes('blog') || q.includes('article') || q.includes('trend') || q.includes('news')) {
    return `### Real Estate Insights & News
We publish regular articles on market trends, property pricing indexes, and smart investment strategies. 

**Popular Articles:**
- *Coimbatore's IT Corridor expansion and its impact on Saravanampatti land value.*
- *Why DTCP approved plots in Annur are the best long-term investment.*

Read all articles on the [#blog](#blog) section.`;
  }

  // 10. Greeting
  if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('greetings') || q.includes('welcome')) {
    return `### Hello! Welcome to Raarya Properties
I am your virtual real estate advisor. I can help you search properties, check home loans, or connect with our support agents.

**Things you can ask me:**
- "Show me plots for sale in Annur"
- "What properties do you have under 15 lakhs?"
- "How do I calculate home loan EMI?"
- "How do I list my own villa?"
- "Office phone number and email"`;
  }

  // Default response
  return `### Raarya Properties Support
Thank you for your message! I can help you find properties, calculate home loans, or connect with our support team.

**Try asking me:**
- "Show me properties in Saravanampatti"
- "What is the agent number for Brahma Park?"
- "Careers at Raarya"
- "Home loan eligibility"

Or visit our [#contact](#contact) page to send a direct message to our customer care team.`;
}

app.listen(PORT, () => {
  console.log(`Zenith Realty Backend Server running on http://localhost:${PORT}`);
});
