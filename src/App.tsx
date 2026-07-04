import { useEffect } from 'react';
import { applyPresetHashOnLoad } from './_shared/preset-site-routing';
import { ZenithNavbar } from './components/ZenithNavbar';
import { HomePage } from './pages/HomePage';

export default function App() {
  useEffect(() => {
    applyPresetHashOnLoad();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8F8] font-lato text-[#141414]">
      <ZenithNavbar />
      <HomePage />
    </div>
  );
}
