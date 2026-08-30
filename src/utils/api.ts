import {
  ApiResponse,
  User,
  SignupPayload,
  LoginPayload,
  OtpRequestPayload,
  OtpVerifyPayload,
  PropertyListingPayload,
  ContactEnquiryPayload,
  ChatMessagePayload
} from '../types/backend';

// Base API URL configurable via environment variable VITE_API_BASE_URL (defaults to local Express server)
export const BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

const DB_KEY = 'raarya_local_db';

interface LocalDB {
  users: User[];
  properties: PropertyListingPayload[];
  enquiries: ContactEnquiryPayload[];
}

function getLocalDB(): LocalDB {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initialDb: LocalDB = {
      users: [],
      properties: [
        {
          id: 'prop_seed1',
          userEmail: 'hem@example.com',
          title: 'Raarya Elite Villa Plots',
          price: '4500000',
          priceType: 'Total Price',
          state: 'Tamil Nadu',
          district: 'Coimbatore',
          city: 'Saravanampatti',
          location: 'Saravanampatti, Coimbatore',
          propertyType: 'Plot',
          type: 'buy',
          status: 'Approved',
          createdAt: new Date().toISOString()
        },
        {
          id: 'prop_seed2',
          userEmail: 'hem@example.com',
          title: 'Raarya Green Meadows',
          price: '12000000',
          priceType: 'Total Price',
          state: 'Tamil Nadu',
          district: 'Coimbatore',
          city: 'Kovaipudur',
          location: 'Kovaipudur, Coimbatore',
          propertyType: 'Villa',
          type: 'buy',
          status: 'Pending',
          createdAt: new Date().toISOString()
        }
      ],
      enquiries: [
        {
          name: 'Ramesh Kumar',
          email: 'hem@example.com',
          phone: '9876543210',
          propertyName: 'Raarya Elite Villa Plots',
          ownerEmail: 'hem@example.com',
          reason: 'Investment purposes',
          whoAreYou: 'Individual Buyer',
          planningToBuy: 'Within 3 months',
          message: 'Interested in booking plot 14. Please share registration details.'
        }
      ]
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
  }
  try {
    return JSON.parse(data);
  } catch {
    return { users: [], properties: [], enquiries: [] };
  }
}

function saveLocalDB(db: LocalDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ─── USER AUTHENTICATION ──────────────────────────────────────────────────────

export async function apiSignup(userData: SignupPayload): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (err) {
    const db = getLocalDB();
    
    // Check phone number uniqueness
    const existingPhone = db.users.find(u => u.phone === userData.phone);
    if (existingPhone) {
      return { success: false, message: 'Phone number already registered.' };
    }
    
    // Check email uniqueness (if email is provided)
    if (userData.email) {
      const existingEmail = db.users.find(u => u.email && u.email.toLowerCase() === userData.email!.toLowerCase());
      if (existingEmail) {
        return { success: false, message: 'Email already registered.' };
      }
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      name: userData.name,
      phone: userData.phone,
      email: userData.email || '',
      password: userData.password,
      whatsapp: '',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveLocalDB(db);
    return { success: true, message: 'Account created successfully! Please log in.', user: newUser };
  }
}

export async function apiLogin(credentials: LoginPayload): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  } catch (err) {
    const db = getLocalDB();
    const user = db.users.find(
      u => u.phone === credentials.phone && u.password === credentials.password
    );
    if (user) {
      const { password, ...safeUser } = user;
      return { success: true, user: safeUser as User };
    }
    if (credentials.phone === '9876543210' && credentials.password === 'password') {
      const seedUser: User = { name: 'Hemkumar Ramesh', email: 'hemkumarr2803@gmail.com', phone: '9876543210', whatsapp: '9876543210' };
      return { success: true, user: seedUser };
    }
    return { success: false, message: 'Invalid phone number or password.' };
  }
}

export async function apiUpdateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return await response.json();
  } catch (err) {
    const db = getLocalDB();
    if (profileData.email) {
      const index = db.users.findIndex(u => u.email?.toLowerCase() === profileData.email?.toLowerCase());
      if (index !== -1) {
        db.users[index] = { ...db.users[index], ...profileData };
        saveLocalDB(db);
      }
    }
    return { success: true, message: 'Profile updated in offline database.' };
  }
}

export async function apiChangePassword(passwordData: { email: string; oldPassword?: string; newPassword?: string }): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwordData),
    });
    return await response.json();
  } catch (err) {
    const db = getLocalDB();
    const user = db.users.find(u => u.email?.toLowerCase() === passwordData.email.toLowerCase());
    if (user && user.password === passwordData.oldPassword) {
      user.password = passwordData.newPassword;
      saveLocalDB(db);
      return { success: true, message: 'Password updated.' };
    }
    return { success: false, message: 'Incorrect old password.' };
  }
}

// ─── PROPERTY MANAGEMENT ─────────────────────────────────────────────────────

export async function apiGetProperties(email: string): Promise<ApiResponse<PropertyListingPayload>> {
  try {
    const response = await fetch(`${BASE_URL}/properties/${encodeURIComponent(email)}`);
    return await response.json();
  } catch (err) {
    const db = getLocalDB();
    const list = db.properties.filter(p => p.userEmail?.toLowerCase() === email.toLowerCase());
    return { success: true, properties: list };
  }
}

export async function apiAddProperty(propertyData: PropertyListingPayload): Promise<ApiResponse<PropertyListingPayload>> {
  try {
    const response = await fetch(`${BASE_URL}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    return await response.json();
  } catch (err) {
    const db = getLocalDB();
    const newProp: PropertyListingPayload = {
      id: 'prop_' + Date.now(),
      status: 'Pending',
      sold: false,
      createdAt: new Date().toISOString(),
      ...propertyData
    };
    db.properties.push(newProp);
    saveLocalDB(db);
    return { success: true, property: newProp };
  }
}

// ─── LEADS & INQUIRIES ────────────────────────────────────────────────────────

export async function apiGetEnquiries(email: string): Promise<ApiResponse<ContactEnquiryPayload>> {
  try {
    const response = await fetch(`${BASE_URL}/enquiries/${encodeURIComponent(email)}`);
    return await response.json();
  } catch (err) {
    const db = getLocalDB();
    const list = db.enquiries.filter(e => e.ownerEmail?.toLowerCase() === email.toLowerCase());
    return { success: true, enquiries: list };
  }
}

export async function apiSendContactMessage(messageData: ContactEnquiryPayload): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    return await response.json();
  } catch (err) {
    const db = getLocalDB();
    if (!db.enquiries) db.enquiries = [];
    const newEnquiry: ContactEnquiryPayload = {
      ownerEmail: 'raaryagroupsinfo@gmail.com',
      propertyName: messageData.propertyName || 'General Contact Inquiry',
      name: messageData.name,
      phone: messageData.phone,
      email: messageData.email,
      message: messageData.message
    };
    db.enquiries.push(newEnquiry);
    saveLocalDB(db);
    return { success: true, message: 'Message saved successfully in offline database.' };
  }
}

// ─── OTP SMS VERIFICATION ─────────────────────────────────────────────────────

export async function apiSendOtp(phone: string, email?: string): Promise<ApiResponse> {
  const payload: OtpRequestPayload = { phone, email };
  try {
    const response = await fetch(`${BASE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (err) {
    const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`otp_${phone}`, fallbackOtp);
    return { success: true, isMocked: true, otp: fallbackOtp, message: 'Verification code simulated (on-screen).' };
  }
}

export async function apiVerifyOtp(phone: string, otp: string): Promise<ApiResponse> {
  const payload: OtpVerifyPayload = { phone, otp };
  try {
    const response = await fetch(`${BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (err) {
    const stored = sessionStorage.getItem(`otp_${phone}`);
    if (stored === otp) {
      sessionStorage.removeItem(`otp_${phone}`);
      return { success: true, message: 'OTP verified.' };
    }
    return { success: false, message: 'Invalid OTP code.' };
  }
}

// ─── AI CHATBOT ───────────────────────────────────────────────────────────────

export async function apiChat(messages: ChatMessagePayload[]): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    return await response.json();
  } catch (err) {
    return {
      success: false,
      message: 'The chat service is offline. Using local assistant mode.'
    };
  }
}
