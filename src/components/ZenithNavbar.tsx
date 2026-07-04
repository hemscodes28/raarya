import React, { useEffect, useState } from 'react';
import { navigateToRoute, routeHref } from '../_shared/preset-site-routing';
import { NAV_ITEMS } from '../routes';
import { PillNav } from './PillNav';

export function ZenithNavbar() {
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
        />

        {/* Desktop Login button only */}
        <div className="hidden lg:flex items-center shrink-0">
          <a
            href="#login"
            className="px-7 py-2.5 text-[13px] font-semibold text-[#141414] border border-black/10 bg-white/80 backdrop-blur-md hover:bg-white rounded-full shadow-sm transition-all"
          >
            Login
          </a>
        </div>
      </div>
    </header>
  );
}
