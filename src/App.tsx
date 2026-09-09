import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { LuxuryLoader } from './components/LuxuryLoader';
import { applyPresetHashOnLoad } from './_shared/preset-site-routing';
import { ZenithNavbar } from './components/ZenithNavbar';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { BlogPage } from './pages/BlogPage';
import { ContactPage } from './pages/ContactPage';
import { MortgagePage } from './pages/MortgagePage';
import { CareersPage } from './pages/CareersPage';
import { CompanyPage } from './pages/CompanyPage';
import { LoginPage } from './pages/LoginPage';
import { UserDashboard } from './components/UserDashboard';
import { onAuthStateChangedWrapper, signOutUser } from './utils/firebaseClient';
import FloatingContactWidget from './components/FloatingContactWidget';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { RaaryaChatbot } from './components/RaaryaChatbot';
import { Footer } from './components/Footer';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<string>('Dashboard');
  const [postPropertyPending, setPostPropertyPending] = useState<boolean>(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash.replace(/^#\/?/, '');
  });
  const [isTransitioning, setIsTransitioning] = useState(true);

  const syncUserFromStorage = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch { }
    }
  };

  // Auto redirect to Add Property dashboard after login if post property was requested
  useEffect(() => {
    if (currentUser && postPropertyPending) {
      setDashboardTab('Add Property');
      setShowDashboard(true);
      setPostPropertyPending(false);
    }
  }, [currentUser, postPropertyPending]);

  // Initial mount load/reload transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 5700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyPresetHashOnLoad();
    syncUserFromStorage();

    const unsubscribe = onAuthStateChangedWrapper((user) => {
      if (user) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch { }
        }
        if (window.location.hash.includes('access_token')) {
          window.location.hash = '';
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Scroll to starting top of page whenever currentRoute changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const t1 = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);

    const t2 = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentRoute]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === 'post-property' || hash === 'post') {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setDashboardTab('Add Property');
          setShowDashboard(true);
        } else {
          setPostPropertyPending(true);
          setShowLogin(true);
        }
      } else if (hash === 'login') {
        setShowLogin(true);
      } else {
        setCurrentRoute(hash);
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setShowDashboard(false);
    setShowLogin(false);
    signOutUser();
    if (window.location.hash === '#login') {
      history.pushState('', '', window.location.pathname);
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const renderActivePage = () => {
    if (currentRoute.startsWith('blog-view/')) {
      const slug = currentRoute.replace('blog-view/', '');
      return <BlogDetailPage slug={slug} />;
    }

    switch (currentRoute) {
      case 'buy':
        return <PropertiesPage initialTab="buy" />;
      case 'rent':
        return <PropertiesPage initialTab="rent" />;
      case 'pg-hostel':
      case 'pg':
        return <PropertiesPage initialTab="pg-hostel" />;
      case 'properties':
        return <PropertiesPage initialTab="all" />;
      case 'blog':
        return <BlogPage />;
      case 'contact':
        return <ContactPage />;
      case 'home-loan':
      case 'emi-calculator':
      case 'eligibility-check':
        return <MortgagePage />;
      case 'careers':
      case 'career':
        return <CareersPage />;
      case 'company':
      case 'about':
        return <CompanyPage />;
      default:
        return <HomePage />;
    }
  };

  const isBlueprintPage = currentRoute !== 'contact';

  return (
    <div className={`min-h-screen font-lato text-[#141414] ${isBlueprintPage ? 'bg-blueprint-pattern' : 'bg-[#F8F8F8]'}`}>
      <AnimatePresence mode="wait">
        {isTransitioning && <LuxuryLoader key="loader" />}
      </AnimatePresence>
      <ZenithNavbar
        currentUser={currentUser}
        onAvatarClick={() => {
          setDashboardTab('Dashboard');
          setShowDashboard(true);
        }}
        onLoginClick={() => setShowLogin(true)}
      />

      <main className="pt-20">
        {renderActivePage()}
      </main>

      {!showLogin && <Footer />}

      {showLogin && (
        <LoginPage
          onBack={() => {
            setShowLogin(false);
            syncUserFromStorage();
            history.pushState('', '', window.location.pathname);
          }}
          onSuccess={(user: any) => {
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setShowLogin(false);
            if (window.location.hash === '#login') {
              history.pushState('', '', window.location.pathname);
            }
          }}
        />
      )}

      {showDashboard && currentUser && (
        <UserDashboard
          user={currentUser}
          initialTab={dashboardTab}
          onClose={() => {
            setShowDashboard(false);
            setDashboardTab('Dashboard');
          }}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}
      {!showLogin && (
        <>
          <FloatingContactWidget onOpenChatbot={() => setShowChatbot(true)} />
          <RaaryaChatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
        </>
      )}
    </div>
  );
}
