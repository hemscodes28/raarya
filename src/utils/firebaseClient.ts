import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;

const app = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;

// Initialize Firebase App Check with registered reCAPTCHA Enterprise Site Key
if (app && typeof window !== 'undefined') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('6Ld6_Z8tAAAAAFo-38gG7thETZkUQ1eCOCEa9WFt'),
      isTokenAutoRefreshEnabled: true
    });
    console.log("Firebase App Check initialized with reCAPTCHA Enterprise!");
  } catch (e) {
    console.warn("App Check note:", e);
  }
}

// Mock listeners list for simulation mode
const mockAuthListeners: Array<(user: any | null) => void> = [];
let mockCurrentUser: any | null = null;

try {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    mockCurrentUser = JSON.parse(stored);
  }
} catch (e) {}

function triggerMockAuthChange() {
  mockAuthListeners.forEach(listener => listener(mockCurrentUser));
}

export function onAuthStateChangedWrapper(callback: (user: any | null) => void) {
  if (auth) {
    return fbOnAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: user.phoneNumber || '',
          whatsapp: '',
          avatar: user.photoURL || ''
        });
      } else {
        callback(null);
      }
    });
  } else {
    mockAuthListeners.push(callback);
    setTimeout(() => callback(mockCurrentUser), 0);
    return () => {
      const idx = mockAuthListeners.indexOf(callback);
      if (idx !== -1) mockAuthListeners.splice(idx, 1);
    };
  }
}

export async function signOutUser(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  } else {
    mockCurrentUser = null;
    localStorage.removeItem('currentUser');
    triggerMockAuthChange();
  }
}

export async function signInWithGoogle(): Promise<{ success: boolean; user?: any; error?: any }> {
  if (!auth) {
    return { success: false, error: "Firebase not configured." };
  }

  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = {
      name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
      email: result.user.email,
      phone: result.user.phoneNumber || '',
      whatsapp: '',
      avatar: result.user.photoURL || ''
    };
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error };
  }
}

export function setupRecaptcha(containerId: string) {
  if (!auth) {
    console.warn("Firebase Auth not initialized.");
    return null;
  }

  try {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {}
    }
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        console.log("Firebase reCAPTCHA solved invisibly.");
      }
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  } catch (e) {
    console.error("Error setting up RecaptchaVerifier:", e);
    return null;
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.length > 10 && !phone.startsWith('+')) {
    return `+${cleaned}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
}

export async function sendFirebaseSms(
  phone: string, 
  containerId: string = "recaptcha-container"
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult | null; error?: any }> {
  if (!auth) {
    return { success: false, error: "Firebase Auth not initialized." };
  }

  const formattedPhone = formatPhoneNumber(phone);
  try {
    const appVerifier = setupRecaptcha(containerId);
    if (appVerifier && typeof appVerifier.render === 'function') {
      await appVerifier.render();
    }
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier!);
    console.log("Firebase SMS dispatched successfully to:", formattedPhone);
    return { success: true, confirmationResult };
  } catch (error: any) {
    console.error("Error in Firebase signInWithPhoneNumber:", error);
    return { success: false, error };
  }
}
