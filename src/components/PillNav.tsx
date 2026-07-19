import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown, Home, X } from 'lucide-react';
import { motion } from 'motion/react';
import { ZenithLogo } from './ZenithLogo';
import { routeHref } from '../_shared/preset-site-routing';
import './PillNav.css';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo?: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  onItemClick?: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  initialLoadAnimation?: boolean;
  currentUser?: any;
  onAvatarClick?: () => void;
}

const DROPDOWNS: Record<string, { label: string; route: string; desc: string }[]> = {
  'Properties': [
    { label: 'Buy (Villas & Plots)', route: '#buy', desc: 'Premium DTCP & RERA approved layout plots' },
    { label: 'Rentals', route: '#rent', desc: 'Modern apartments and independent rental homes' },
    { label: 'PG / Hostels', route: '#pg-hostel', desc: 'Serviced men/girls student & working PGs' },
  ],
};

export function PillNav({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  onMobileMenuClick,
  onItemClick,
  initialLoadAnimation = true,
  currentUser,
  onAvatarClick
}: PillNavProps) {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.4, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.4, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.4, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        // Clip a wrapper instead so nav-items container stays overflow:visible for dropdowns
        gsap.set(navItems, { width: 0, clipPath: 'inset(0px)' });
        gsap.to(navItems, {
          width: 'auto',
          clipPath: 'inset(0px -200px -200px -200px)',
          duration: 0.6,
          ease,
          onComplete: () => {
            // Clear clip so dropdowns can overflow freely
            gsap.set(navItems, { clearProps: 'clipPath' });
          }
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.4,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible', left: '50%', top: '50%', xPercent: -50, yPercent: -50 });
        gsap.fromTo(
          menu,
          { opacity: 0, scale: 0.9, xPercent: -50, yPercent: -50 },
          {
            opacity: 1,
            scale: 1,
            xPercent: -50,
            yPercent: -50,
            duration: 0.35,
            ease: 'back.out(1.4)',
            transformOrigin: 'center center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          scale: 0.9,
          xPercent: -50,
          yPercent: -50,
          duration: 0.2,
          ease: 'power2.in',
          transformOrigin: 'center center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor
  } as React.CSSProperties;

  return (
    <div className="pill-nav-container w-full">
      <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
        <a
          className="pill-logo"
          href={routeHref('')}
          aria-label="Home"
          onClick={(e) => {
            if (onItemClick) onItemClick(e, '');
          }}
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
        >
          {logo ? (
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          ) : (
            <div className="scale-90" ref={logoImgRef as any}>
              <ZenithLogo />
            </div>
          )}
        </a>

        <div className="pill-nav-items desktop-only" ref={navItemsRef} style={{ overflow: 'visible' }}>
          <ul className="pill-list" role="menubar" style={{ overflow: 'visible' }}>
            {items.map((item, i) => (
              <li key={item.href || `item-${i}`} role="none" style={{ overflow: 'visible', position: 'relative' }}>
                {/* Wrapper div triggers group-hover for dropdown */}
                <div className="relative group flex h-full" style={{ overflow: 'visible' }}>
                  <a
                    role="menuitem"
                    href={item.href}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onClick={(e) => {
                      if (onItemClick) onItemClick(e, item.href);
                    }}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    style={{ overflow: 'hidden' }}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  </a>

                  {/* Dropdown popup for Properties (Desktop) - sibling of pill, NOT nested inside it */}
                  {DROPDOWNS[item.label] && (
                    <div
                      style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: '320px', position: 'absolute', paddingTop: '8px' }}
                      className="flex flex-col opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                    >
                      <div className="bg-white border border-black/5 p-4 rounded-2xl shadow-xl flex flex-col gap-2">
                      {DROPDOWNS[item.label].map((subItem) => (
                        <a
                          key={subItem.label}
                          href={subItem.route}
                          onClick={(e) => {
                            if (onItemClick) onItemClick(e, subItem.route);
                          }}
                          className="group/sub flex flex-col p-2.5 rounded-xl hover:bg-black/[0.02] transition-all duration-300"
                        >
                          <span className="text-[13px] font-semibold text-[#141414] group-hover/sub:text-black transition-colors">
                            {subItem.label}
                          </span>
                          <span className="text-[11px] text-[#A5A5A5] leading-relaxed mt-0.5">
                            {subItem.desc}
                          </span>
                        </a>
                      ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {/* Glassmorphic Mobile Menu Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/65 backdrop-blur-[6px] z-[998] transition-all duration-300 mobile-only"
          onClick={() => {
            setIsMobileMenuOpen(false);
            toggleMobileMenu();
          }}
        />
      )}

      <div 
        className="mobile-menu-popover mobile-only" 
        ref={mobileMenuRef} 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '340px',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          padding: '24px',
          boxSizing: 'border-box',
          zIndex: 9999,
          ...cssVars
        }}
      >
        {/* Mobile Header: Gold Logo + Close button */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/5 relative z-10 select-none">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="Raarya Logo" 
            className="h-12 object-contain"
          />
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              toggleMobileMenu();
            }}
            className="w-10 h-10 rounded-full bg-[#141414] hover:bg-black text-white flex items-center justify-center active:scale-90 transition-all z-20 cursor-pointer shadow-md"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ul className="mobile-menu-list">
          {items.map((item, i) => (
            <li key={item.href || `mobile-item-${i}`} className="flex flex-col">
              <div className="flex items-center justify-between w-full">
                <motion.a
                  href={item.href}
                  className={`mobile-menu-link flex-grow ${activeHref === item.href ? ' is-active' : ''}`}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    toggleMobileMenu();
                    if (onItemClick) onItemClick(e, item.href);
                  }}
                  whileTap={{ scale: 0.96, backgroundColor: '#c5a880', color: '#141414' }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {item.label}
                </motion.a>
                {DROPDOWNS[item.label] && (
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                    className="p-3 text-[#141414]"
                    aria-label={`Toggle ${item.label} sub-items`}
                  >
                    <ChevronDown className={`size-4 transition-transform duration-300 ${
                      mobileExpanded === item.label ? 'rotate-180' : ''
                    }`} />
                  </button>
                )}
              </div>
              
              {/* Mobile Accordion */}
              {DROPDOWNS[item.label] && mobileExpanded === item.label && (
                <div className="flex flex-col gap-1 pl-4 border-l border-black/10 mt-1 mb-2">
                  {DROPDOWNS[item.label].map((subItem) => (
                    <motion.a
                      key={subItem.label}
                      href={subItem.route}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        toggleMobileMenu();
                        if (onItemClick) onItemClick(e, subItem.route);
                      }}
                      className="flex flex-col py-2.5 px-4 rounded-xl hover:bg-black/[0.02] text-left"
                      whileTap={{ scale: 0.97, backgroundColor: 'rgba(197, 168, 128, 0.1)' }}
                    >
                      <span className="text-[13px] font-semibold text-[#141414]">{subItem.label}</span>
                      <span className="text-[10px] text-[#A5A5A5] mt-0.5">{subItem.desc}</span>
                    </motion.a>
                  ))}
                </div>
              )}
            </li>
          ))}

          {/* Mobile Login and CTA */}
          <li className="mt-4 pt-4 border-t border-black/5 flex flex-col gap-2">
            {currentUser ? (
              <motion.button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  toggleMobileMenu();
                  if (onAvatarClick) onAvatarClick();
                }}
                className="flex items-center gap-3 border border-black/10 bg-white px-4 py-2 rounded-full text-left cursor-pointer"
                whileTap={{ scale: 0.96 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white uppercase text-xs shrink-0 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name ? currentUser.name.charAt(0) : currentUser.email.charAt(0)
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-bold text-[#141414] leading-tight truncate">{currentUser.name || 'User'}</span>
                  <span className="text-[9px] text-slate-500 leading-none truncate">{currentUser.email}</span>
                </div>
              </motion.button>
            ) : (
              <motion.a
                href="#login"
                className="flex items-center justify-center border border-black/10 bg-white px-6 py-2.5 text-[13px] font-semibold text-[#141414] rounded-full cursor-pointer"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  toggleMobileMenu();
                }}
                whileTap={{ scale: 0.96, backgroundColor: '#141414', color: '#ffffff' }}
              >
                Login
              </motion.a>
            )}
            <motion.a
              href="#contact"
              className="flex items-center justify-center gap-2 bg-[#141414] px-6 py-2.5 text-[13px] font-semibold text-white rounded-full cursor-pointer"
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                toggleMobileMenu();
                if (onItemClick) onItemClick(e, '#contact');
              }}
              whileTap={{ scale: 0.96, backgroundColor: '#c5a880', color: '#141414' }}
            >
              <Home className="size-4" />
              Book Consultation
            </motion.a>
          </li>
        </ul>
      </div>
    </div>
  );
}
export default PillNav;
