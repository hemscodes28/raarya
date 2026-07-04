import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { navigateToRoute } from '../_shared/preset-site-routing';
import { useDraftlyGalleryAutoplay } from '../_shared/hooks/useDraftlyGalleryAutoplay';
import { HERO_VIDEO } from '../constants';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryAutoplay = useDraftlyGalleryAutoplay(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !galleryAutoplay) return;
    void video.play().catch(() => {});
  }, [galleryAutoplay]);

  return (
    <section id="hero" className="relative px-3 pt-24 pb-3 bg-[#F8F8F8] md:px-4 flex items-center justify-center">
      <div className="relative w-full h-[calc(100vh-7.5rem)] rounded-[24px] overflow-hidden shadow-2xl border border-black/5 bg-[#141414]">
        <video
          ref={videoRef}
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-black/25 z-10" />
        
        {/* Quote Overlay - Top Left */}
        <div className="absolute left-8 top-8 md:left-12 md:top-12 z-20 text-left max-w-xs md:max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-2xl lg:text-3xl font-serif text-[#141414] tracking-tight italic font-medium leading-snug"
            style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}
          >
            "The best investment on Earth is Earth."
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-2 text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141414]/70"
          >
            — RAARYA GROUPS
          </motion.p>
        </div>
      </div>
    </section>
  );
}
