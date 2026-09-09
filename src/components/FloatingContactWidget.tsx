import { useState, useEffect } from "react";
import { PhoneCall, Sparkles } from "lucide-react";

interface FloatingContactWidgetProps {
  onOpenChatbot: () => void;
}

export default function FloatingContactWidget({ onOpenChatbot }: FloatingContactWidgetProps) {
  const [hidden, setHidden] = useState(false);
  const phoneNumber = "9087240400";
  const whatsappUrl = `https://wa.me/91${phoneNumber}`;
  const phoneUrl = `tel:${phoneNumber}`;

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        // Hide widget when the footer is near or entering viewport
        if (rect.top <= window.innerHeight - 60) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] touch-manipulation transition-all duration-300">
      {/* 
        Raarya Luxury Glass Icon Dock
        Icon-only design with sleek floating glass hover tooltips for zero layout reflow
      */}
      <div className="relative p-[1px] rounded-full bg-gradient-to-r from-[#c5a880]/50 via-white/25 to-[#9a7d55]/50 shadow-[0_12px_40px_rgba(0,0,0,0.65)] hover:shadow-[0_12px_50px_rgba(197,168,128,0.3)] transition-all duration-300">

        {/* Obsidian Glass Body */}
        <div className="relative bg-[#0d0d11]/90 backdrop-blur-xl rounded-full p-1.5 sm:p-2 flex items-center gap-2 sm:gap-2.5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">

          {/* Live Status Breathing Dot */}
          <div className="flex items-center pl-2 pr-1 pointer-events-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a880] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5a880] shadow-[0_0_6px_#c5a880]"></span>
            </span>
          </div>

          {/* 1. CALL DIRECT ICON */}
          <div className="relative group/btn">
            {/* Floating Glass Tooltip */}
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-90 translate-y-1 group-hover/btn:opacity-100 group-hover/btn:scale-100 group-hover/btn:translate-y-0 transition-all duration-200 ease-out z-50">
              <div className="relative bg-[#181613]/95 backdrop-blur-md border border-[#c5a880]/40 text-[#e8d5b7] px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap shadow-2xl">
                Call Direct
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#181613] border-r border-b border-[#c5a880]/40 rotate-45"></div>
              </div>
            </div>

            {/* Icon Button */}
            <a
              href={phoneUrl}
              aria-label="Call Direct"
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#181613] hover:bg-[#26211a] border border-[#c5a880]/40 text-[#e8d5b7] active:scale-90 hover:scale-105 transition-all duration-200 cursor-pointer select-none shadow-md"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#c5a880] via-[#d4b890] to-[#9a7d55] flex items-center justify-center text-[#0a0a0d] shadow-sm">
                <PhoneCall className="w-4 h-4 text-[#0a0a0d]" />
              </div>
            </a>
          </div>

          {/* 2. WHATSAPP ICON */}
          <div className="relative group/btn">
            {/* Floating Glass Tooltip */}
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-90 translate-y-1 group-hover/btn:opacity-100 group-hover/btn:scale-100 group-hover/btn:translate-y-0 transition-all duration-200 ease-out z-50">
              <div className="relative bg-[#0e1f18]/95 backdrop-blur-md border border-emerald-500/40 text-emerald-200 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap shadow-2xl">
                WhatsApp Chat
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0e1f18] border-r border-b border-emerald-500/40 rotate-45"></div>
              </div>
            </div>

            {/* Icon Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Chat"
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0e1f18] hover:bg-[#153127] border border-emerald-500/40 text-emerald-200 active:scale-90 hover:scale-105 transition-all duration-200 cursor-pointer select-none shadow-md"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center text-white shadow-sm">
                <svg
                  className="w-4 h-4 text-white fill-current"
                  viewBox="0 0 448 512"
                >
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
              </div>
            </a>
          </div>

          {/* 3. ASK RAARYA AI ICON */}
          <div className="relative group/btn">
            {/* Floating Glass Tooltip */}
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-90 translate-y-1 group-hover/btn:opacity-100 group-hover/btn:scale-100 group-hover/btn:translate-y-0 transition-all duration-200 ease-out z-50">
              <div className="relative bg-[#1c1622]/95 backdrop-blur-md border border-amber-400/40 text-amber-200 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap shadow-2xl">
                Ask Raarya AI
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1c1622] border-r border-b border-amber-400/40 rotate-45"></div>
              </div>
            </div>

            {/* Icon Button */}
            <button
              onClick={onOpenChatbot}
              aria-label="Ask Raarya AI"
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1c1622] hover:bg-[#292033] border border-amber-400/50 text-amber-200 active:scale-90 hover:scale-105 transition-all duration-200 cursor-pointer select-none outline-none shadow-md"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-sm">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}




