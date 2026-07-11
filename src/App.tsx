import { useEffect, useState } from 'react';
import { applyPresetHashOnLoad } from './_shared/preset-site-routing';
import { ZenithNavbar } from './components/ZenithNavbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { OtpVerification } from './components/OtpVerification';
import { UserDashboard } from './components/UserDashboard';
import { supabase } from './utils/supabaseClient';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const syncUserFromStorage = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch {}
    }
  };

  useEffect(() => {
    applyPresetHashOnLoad();
    syncUserFromStorage();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          const userMeta = session.user.user_metadata;
          const safeUser = {
            name: userMeta.full_name || userMeta.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            phone: session.user.phone || '',
            whatsapp: '',
            avatar: userMeta.avatar_url || ''
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
      return () => subscription.unsubscribe();
    }
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
  };

  const handleUserUpdate = (updatedUser: any) => {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const handleOtpVerifySuccess = () => {
    if (pendingUser) {
      localStorage.setItem('currentUser', JSON.stringify(pendingUser));
      setCurrentUser(pendingUser);
      setPendingUser(null);
      setShowOtpVerification(false);
      setShowLogin(false);
      
      // Force clean up URL redirect hash
      if (window.location.hash.includes('access_token')) {
        window.location.hash = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-lato text-[#141414]">
      {showOtpVerification && pendingUser && (
        <OtpVerification
          email={pendingUser.email}
          onVerify={handleOtpVerifySuccess}
          onCancel={() => {
            setShowOtpVerification(false);
            setPendingUser(null);
            if (supabase) supabase.auth.signOut();
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
          onSuccess={(user: any) => {
            setPendingUser(user);
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
    </div>
  );
}
