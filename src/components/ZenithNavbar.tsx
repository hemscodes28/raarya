import React, { useEffect, useState } from 'react';
import { navigateToRoute } from '../_shared/preset-site-routing';
import { NAV_ITEMS } from '../routes';
import { PillNav } from './PillNav';
import { LayoutGrid } from 'lucide-react';

interface NavbarProps {
  currentUser?: any;
  onAvatarClick?: () => void;
}

export function ZenithNavbar({ currentUser, onAvatarClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState('');

  // Update scrolled state to trigger header shrink and blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync active item with current URL hash
  useEffect(() => {
    const handleHash = () => {
      setActiveHref(window.location.hash || '');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navClick = (e: React.MouseEvent<HTMLAnchorElement>, route: string) => {
    e.preventDefault();
    navigateToRoute(route);
  };

  return (
    <header 
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-2.5 bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5 px-5 md:px-10' 
          : 'py-5 bg-transparent px-5 md:px-10'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <PillNav
          logo="/preset-sites/zenith-realty/logo.png"
          logoAlt="RAARYA"
          items={NAV_ITEMS.map((item) => ({ label: item.label, href: item.route }))}
          activeHref={activeHref}
          className="flex-grow"
          baseColor="#ffffff" // Background behind pills
          pillColor="#141414" // Default pill color (dark charcoal)
          hoveredPillTextColor="#141414" // Text color inside pill on hover
          pillTextColor="#ffffff" // Text color inside pill initially
          onItemClick={navClick}
          initialLoadAnimation={true}
          currentUser={currentUser}
          onAvatarClick={onAvatarClick}
        />

        {/* Desktop Login button or Avatar */}
        <div className="hidden lg:flex items-center shrink-0">
          {currentUser ? (
            <button
              onClick={onAvatarClick}
              className="flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 rounded-full bg-gradient-to-r from-[#141414] to-[#201d18] hover:from-black hover:to-[#1c1813] border border-amber-500/25 shadow-md shadow-amber-500/5 hover:shadow-amber-500/15 hover:border-amber-500/45 transition-all duration-300 hover:scale-[1.03] group cursor-pointer"
              title={currentUser.name || currentUser.email}
            >
              {/* Avatar circle */}
              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-xs text-amber-400 uppercase overflow-hidden shrink-0 ring-2 ring-amber-500/25 group-hover:ring-amber-500/45 transition-all duration-300">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser.name ? currentUser.name.charAt(0) : currentUser.email.charAt(0)
                )}
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[8px] text-amber-500/60 font-bold uppercase tracking-[0.2em] leading-none">My Space</span>
                <span className="text-[11px] text-white group-hover:text-amber-200 font-extrabold leading-tight truncate max-w-[80px] mt-0.5 transition-colors">
                  {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
                </span>
              </div>
              <LayoutGrid className="w-3.5 h-3.5 text-amber-500/45 group-hover:text-amber-400 group-hover:rotate-45 transition-all duration-300 shrink-0 ml-1" />
            </button>
          ) : (
            <a
              href="#login"
              className="px-7 py-2.5 text-[13px] font-semibold text-[#141414] border border-black/10 bg-white/80 backdrop-blur-md hover:bg-white rounded-full shadow-sm transition-all"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
