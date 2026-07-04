import { useEffect, useState } from 'react';
import { applyPresetHashOnLoad } from './_shared/preset-site-routing';
import { ZenithNavbar } from './components/ZenithNavbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    applyPresetHashOnLoad();
  }, []);

  // Listen for hash changes to open/close login
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#login') {
        setShowLogin(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-lato text-[#141414]">
      <ZenithNavbar />
      <HomePage />
      {showLogin && (
        <LoginPage
          onBack={() => {
            setShowLogin(false);
            // Clear the hash without triggering scroll
            history.pushState('', '', window.location.pathname);
          }}
        />
      )}
    </div>
  );
}
