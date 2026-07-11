import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

import banner1 from "../../BANNER-1.jpg.jpeg";
import thulir1 from "../../THULIR-1.jpg.jpeg";
import zetta1 from "../../ZETTA-1.jpg.jpeg";

const IMAGES = [banner1, thulir1, zetta1];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      goNext();
    }, 3800);
    return () => clearTimeout(timer);
  }, [currentIndex, isPaused]);

  const goNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  };

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "tween" as const, duration: 0.65, ease: "easeOut" as const },
        opacity: { duration: 0.4 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: {
        x: { type: "tween" as const, duration: 0.65, ease: "easeOut" as const },
        opacity: { duration: 0.4 },
      },
    }),
  };

  return (
    <section
      id="hero"
      className="relative bg-[#F8F8F8] flex flex-col pt-[140px] md:pt-[120px] lg:pt-[150px] pb-6"
    >
      {/* Quote — left-aligned, responsive font, wrapped correctly on all mobile screens */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="px-4 md:px-6 lg:px-8 mb-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 select-none"
      >
        <span
          className="text-lg md:text-2xl lg:text-[28px] font-serif italic font-medium text-[#141414] tracking-tight leading-snug"
          style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}
        >
          "The best investment on Earth is Earth."
        </span>
        <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-[#141414]/40 whitespace-nowrap">
          — RAARYA GROUPS
        </span>
      </motion.div>

      {/* Carousel — full-width minus a small bezel-like gap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.15 }}
        className="relative w-full px-4 md:px-6 lg:px-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full rounded-[20px] md:rounded-[28px] overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.18)] border border-black/[0.07] bg-[#1a1a1a] group select-none">

          {/* Edge vignette blend */}
          <div
            className="absolute inset-0 z-10 pointer-events-none rounded-[20px] md:rounded-[28px]"
            style={{
              boxShadow:
                "inset 30px 0 50px -15px rgba(0,0,0,0.25), inset -30px 0 50px -15px rgba(0,0,0,0.25), inset 0 -20px 40px -5px rgba(0,0,0,0.15), inset 0 15px 30px -5px rgba(0,0,0,0.1)",
            }}
          />

          {/* Slide area with responsive banner aspect ratios to display perfectly on all phones/tablets/desktops */}
          <div className="relative w-full overflow-hidden aspect-[16/6] sm:aspect-[16/5.2] md:aspect-[16/4.8]">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={currentIndex}
                src={IMAGES[currentIndex]}
                alt={`Banner ${currentIndex + 1}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "fill" }}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* Left arrow */}
          <button
            onClick={goPrev}
            className="absolute left-3 md:left-7 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-black/25 hover:bg-white text-white hover:text-[#141414] border border-white/30 hover:border-white/70 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Previous banner"
          >
            <span className="text-sm md:text-xl font-light leading-none select-none">&lt;</span>
          </button>

          {/* Right arrow */}
          <button
            onClick={goNext}
            className="absolute right-3 md:right-7 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-black/25 hover:bg-white text-white hover:text-[#141414] border border-white/30 hover:border-white/70 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Next banner"
          >
            <span className="text-sm md:text-xl font-light leading-none select-none">&gt;</span>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 md:gap-2">
            {IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`rounded-full transition-all duration-300 ease-out cursor-pointer ${
                  index === currentIndex
                    ? "w-5 md:w-9 h-1.5 md:h-2.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                    : "w-1.5 md:w-2.5 h-1.5 md:h-2.5 bg-white/40 hover:bg-white/75"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>

          {/* Autoplay progress bar */}
          {!isPaused && (
            <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-black/20 overflow-hidden">
              <motion.div
                key={`progress-${currentIndex}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3.8, ease: "linear" }}
                className="h-full bg-white/65 origin-left"
              />
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
