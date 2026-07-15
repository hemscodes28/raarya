import { useEffect, useState } from 'react';
import { applyPresetHashOnLoad } from './_shared/preset-site-routing';
import { ZenithNavbar } from './components/ZenithNavbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { OtpVerification } from './components/OtpVerification';
import { UserDashboard } from './components/UserDashboard';
import { onAuthStateChangedWrapper, signOutUser } from './utils/firebaseClient';
import FloatingContactWidget from './components/FloatingContactWidget';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [mockOtp, setMockOtp] = useState<string>('');

  const syncUserFromStorage = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch {}
    }
  };

  useEffect(() => {
    applyPresetHashOnLoad();
    syncUserFromStorage();

    const unsubscribe = onAuthStateChangedWrapper((user) => {
      if (user) {
        const safeUser = {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          whatsapp: '',
          avatar: user.avatar || ''
        };
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          setPendingUser(safeUser);
          setShowOtpVerification(true);
          setShowLogin(true); // Ensure login overlay is visible so they see OTP
        } else {
          setCurrentUser(JSON.parse(storedUser));
        }
        
        // Clear access token hash from URL if present
        if (window.location.hash.includes('access_token')) {
          window.location.hash = '';
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#login') setShowLogin(true);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setShowDashboard(false);
    signOutUser();
  };

  const handleUserUpdate = (updatedUser: any) => {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const handleOtpVerifySuccess = (verifiedPhone: string) => {
    if (pendingUser) {
      const finalUser = {
        ...pendingUser,
        phone: verifiedPhone
      };
      
      const saveAndComplete = async () => {
        if (finalUser.email) {
          try {
            const { apiUpdateProfile } = await import('./utils/api');
            await apiUpdateProfile({ email: finalUser.email, phone: verifiedPhone, name: finalUser.name });
          } catch {}
        }
        localStorage.setItem('currentUser', JSON.stringify(finalUser));
        setCurrentUser(finalUser);
        setPendingUser(null);
        setShowOtpVerification(false);
        setShowLogin(false);
        
        // Force clean up URL redirect hash
        if (window.location.hash.includes('access_token')) {
          window.location.hash = '';
        }
      };
      
      saveAndComplete();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-lato text-[#141414]">
      {showOtpVerification && pendingUser && (
        <OtpVerification
          phone={pendingUser.phone}
          mockOtp={mockOtp}
          onVerify={handleOtpVerifySuccess}
          onCancel={() => {
            setShowOtpVerification(false);
            setPendingUser(null);
            setMockOtp('');
            signOutUser();
          }}
        />
      )}
      <ZenithNavbar
        currentUser={currentUser}
        onAvatarClick={() => setShowDashboard(true)}
      />
      <HomePage />

      {showLogin && (
        <LoginPage
          onBack={() => {
            setShowLogin(false);
            syncUserFromStorage();
            history.pushState('', '', window.location.pathname);
          }}
          onSuccess={(user: any, mockOtp?: string) => {
            setPendingUser(user);
            setMockOtp(mockOtp || '');
            setShowOtpVerification(true);
          }}
        />
      )}

      {showDashboard && currentUser && (
        <UserDashboard
          user={currentUser}
          onClose={() => setShowDashboard(false)}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}
      {!showLogin && !showOtpVerification && <FloatingContactWidget />}
    </div>
  );
}
