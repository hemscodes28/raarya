import React, { useState, useRef, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  animate 
} from 'motion/react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  AlertCircle,
  Navigation,
  ExternalLink
} from 'lucide-react';
import DotField from '../components/DotField';
import { apiSendContactMessage } from '../utils/api';

interface FloatingFieldProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  isTextArea?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function FloatingField({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  error,
  isTextArea = false,
  onFocus,
  onBlur,
}: FloatingFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const isFloating = isFocused || value.length > 0;

  return (
    <div className="relative mt-2">
      {isTextArea ? (
        <textarea
          id={id}
          name={name}
          rows={4}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`peer w-full resize-none bg-white hover:bg-white text-black font-normal rounded-xl px-5 py-4 text-[14px] sm:text-base outline-none border transition-all duration-300 placeholder-transparent
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-black/[0.08] hover:border-black/[0.15] focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
            }
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)]`}
          placeholder=" "
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`peer w-full bg-white hover:bg-white text-black font-normal rounded-xl px-5 py-4 text-[14px] sm:text-base outline-none border transition-all duration-300 placeholder-transparent
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-black/[0.08] hover:border-black/[0.15] focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
            }
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)]`}
          placeholder=" "
        />
      )}
      
      {/* Outlined Floating Label Animation */}
      <label
        htmlFor={id}
        className={`absolute left-5 transition-all duration-300 pointer-events-none origin-left text-sm font-medium
          ${isFloating
            ? 'top-0 -translate-y-1/2 text-xs text-amber-600 bg-white px-2'
            : isTextArea
              ? 'top-5 text-black/40 text-[14px] sm:text-base'
              : 'top-1/2 -translate-y-1/2 text-black/40 text-[14px] sm:text-base'
          }`}
      >
        {label}
      </label>
    </div>
  );
}

// Custom Drag Swipe to Submit Button component (Gold & Charcoal Black Theme)
interface SwipeButtonProps {
  isSubmitting: boolean;
  onSwipeSuccess: () => void;
  onValidate: () => boolean;
}

export function SwipeButton({ isSubmitting, onSwipeSuccess, onValidate }: SwipeButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const thumbWidth = 56; // h-14 is 56px
  const x = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dragMax = Math.max(0, containerWidth - thumbWidth);

  // Compute slide background fills and text transparency
  const progressWidth = useTransform(x, [0, dragMax], [thumbWidth, containerWidth]);
  const textOpacity = useTransform(x, [0, dragMax * 0.6], [1, 0]);

  const handleDragEnd = () => {
    // If dragged past 85% of the slide track
    if (x.get() >= dragMax * 0.85) {
      if (onValidate()) {
        animate(x, dragMax, { type: 'spring', stiffness: 400, damping: 30 });
        onSwipeSuccess();
      } else {
        // Snap back if form is invalid
        animate(x, 0, { type: 'spring', stiffness: 350, damping: 25 });
      }
    } else {
      // Snap back to start
      animate(x, 0, { type: 'spring', stiffness: 350, damping: 25 });
    }
  };

  // Reset position when submission status resets
  useEffect(() => {
    if (!isSubmitting) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  }, [isSubmitting, x]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-14 bg-amber-50/50 rounded-xl overflow-hidden border border-amber-100/80 shadow-[inset_0_2px_4px_rgba(212,175,55,0.04)] flex items-center select-none"
    >
      {/* Slide progress background fill (Gold theme) */}
      <motion.div 
        style={{ width: progressWidth }}
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-20 pointer-events-none rounded-xl"
      />

      {/* Floating Swipe Prompt Text */}
      <motion.div 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-800/75 select-none">
          Swipe to Submit Inquiry
        </span>
      </motion.div>

      {/* Slide Handle (Thumb) */}
      <motion.div
        drag="x"
        dragElastic={0.1}
        dragMomentum={false}
        dragConstraints={{ left: 0, right: dragMax }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="absolute left-0 top-0 bottom-0 w-14 h-14 bg-[#141414] hover:bg-[#1a1a1a] rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_4px_15px_rgba(0,0,0,0.15)] border border-amber-500/20 z-10 transition-colors"
      >
        {isSubmitting ? (
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          /* Live Arrow Motion Loop Indicator (Gold arrow) */
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="text-amber-400"
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim().replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please write a message';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await apiSendContactMessage(formData);
      if (res.success) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitError(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubmitError('Failed to establish connection. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Pinterest SVG
  const PinterestIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.23 2.63 7.85 6.33 9.33-.1-.79-.2-2 .04-2.87.22-.88 1.4-5.9 1.4-5.9s-.35-.71-.35-1.76c0-1.65.96-2.88 2.15-2.88.99 0 1.5 1.05 1.5 2.15 0 1.02-.65 2.54-.99 3.96-.28 1.18.6 2.15 1.76 2.15 2.11 0 3.73-2.23 3.73-5.44 0-2.84-2.04-4.83-4.96-4.83-3.38 0-5.36 2.54-5.36 5.15 0 1.02.39 2.12.88 2.72.1.12.11.23.08.35-.09.38-.3.1.37-.39.1-.12.08-.2.03-.29-.32-.54-.64-1.21-.64-1.95 0-2.88 2.1-5.53 6.04-5.53 3.17 0 5.64 2.26 5.64 5.29 0 3.15-1.99 5.68-4.75 5.68-.93 0-1.8-.48-2.1-1.05l-.57 2.18c-.21.81-.77 1.83-1.15 2.45C9.77 21.84 10.86 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  );

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full bg-[#F8F8F8] text-[#141414] overflow-hidden flex flex-col justify-center pt-4 sm:pt-6 pb-16 md:py-20 px-4 sm:px-6 lg:px-8">
      {/* Background DotField Component - Calibrated with Gold accent and smaller cursor point */}
      <div className="absolute inset-0 z-0">
        <DotField
          dotRadius={2.3}         // Refined dot size
          dotSpacing={14}         // Dense particle grid density
          cursorRadius={140}      // SMALLER cursor radius so it doesn't split too much space
          cursorForce={0.25}
          bulgeOnly={true}
          bulgeStrength={45}      // Subtle tighter displacement bulge
          glowRadius={130}        // Tighter spotlight
          sparkle={false}
          waveAmplitude={0}
          gradientFrom="rgba(212, 175, 55, 0.55)" // Gold dots matching Raarya logo
          gradientTo="rgba(180, 140, 50, 0.4)"   // Subtle gold details
          glowColor="rgba(212, 175, 55, 0.15)"    // Golden cursor spotlight
        />
      </div>

      {/* Light gradient overlay to blend navbar and bottom section */}
      <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#F8F8F8] via-[#F8F8F8] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8F8F8]/10 to-[#F8F8F8] pointer-events-none z-10" />

      <div className="relative z-20 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          
          {/* Left Column: Title, Quote & Company Info */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
            
            {/* Header Title & Quote */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-amber-600 text-xs font-bold tracking-[0.25em] uppercase block mb-2">
                  Reach Out
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#141414]">
                  Get in Touch
                </h1>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="pt-4 border-t border-black/5 space-y-3"
              >
                <blockquote 
                  className="text-lg md:text-xl font-serif italic text-black/75 leading-relaxed"
                  style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}
                >
                  "A home is not just a place of shelter; it is a sanctuary where dreams find their form and futures are built."
                </blockquote>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-black/40">
                  — RAARYA GROUPS
                </p>
              </motion.div>
            </div>

            {/* Company details list (Styled as Rich Lift Cards - more transparent to see dots, unified gold accent) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Address Card */}
              <div className="bg-white/60 border border-black/[0.03] shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-sm rounded-2xl p-5 flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:border-amber-500/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest">Address</h4>
                  <p className="mt-1 text-sm text-black/80 leading-relaxed font-light">
                    2D, A-Block, Ram Apartment 642FF4, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037.
                  </p>
                  
                  {/* Location Tracker Button */}
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Ram+Apartment,+Avinashi+Road,+Lakshmi+Mills+Junction,+Coimbatore+-+641037"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50/50 hover:bg-amber-50 px-3.5 py-1.5 rounded-lg border border-amber-100 shadow-sm hover:shadow transition-all duration-200 hover:scale-[1.02]"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Track Location
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>

              {/* Information Card */}
              <div className="bg-white/60 border border-black/[0.03] shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-sm rounded-2xl p-5 flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:border-amber-500/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-amber-600" />
                </div>
                <div className="w-full min-w-0">
                  <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest">Information</h4>
                  <div className="mt-1 flex flex-col text-sm text-black/80 space-y-1 font-light">
                    <a href="tel:+919087240400" className="hover:text-amber-600 transition-colors inline-flex items-center gap-1.5 w-fit">
                      <Phone className="w-3.5 h-3.5 opacity-60" /> +91 9087240400
                    </a>
                    <a href="mailto:raaryagroupsinfo@gmail.com" className="hover:text-amber-600 transition-colors inline-flex items-center gap-1.5 truncate max-w-full">
                      <Mail className="w-3.5 h-3.5 opacity-60" /> raaryagroupsinfo@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Opening Hours Card */}
              <div className="bg-white/60 border border-black/[0.03] shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-sm rounded-2xl p-5 flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:border-amber-500/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest">Opening Hours</h4>
                  <p className="mt-1 text-sm text-black/80 font-light">
                    Monday - Sunday : 9.45am - 6.15pm
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Social follow us */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-3"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#141414]/40 block">
                Follow Us
              </span>
              <div className="flex items-center gap-3">
                {[
                  { name: 'Facebook', url: 'https://www.facebook.com/RaaryaGroups', icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H7v3h2v9h3v-9h2.72l.42-3H12V6.5c0-.88.72-1 1-1h2V2h-3C9.75 2 9 3.5 9 5.5V8z"/>
                    </svg>
                  ), color: 'hover:bg-[#1877F2] hover:border-[#1877F2]' },
                  { name: 'Instagram', url: 'https://www.instagram.com/raaryagroups/', icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  ), color: 'hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent' },
                  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/raarya-groups-332753283/', icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  ), color: 'hover:bg-[#0A66C2] hover:border-[#0A66C2]' },
                  { name: 'YouTube', url: 'https://www.youtube.com/@RaaryaGroups', icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.002 3.002 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  ), color: 'hover:bg-[#FF0000] hover:border-[#FF0000]' },
                  { name: 'Pinterest', url: 'https://in.pinterest.com/raaryagroups/', icon: <PinterestIcon />, color: 'hover:bg-[#BD081C] hover:border-[#BD081C]' }
                ].map((social, idx) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Follow Raarya Groups on ${social.name}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                    className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-[#141414]/65 bg-white/70 backdrop-blur-sm transition-all duration-300 ${social.color} hover:text-white hover:scale-115 hover:shadow-md`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Outlined Floating Label Form Card (Semi-transparent for visible dots) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', damping: 20 }}
              className="relative bg-white/70 border border-black/[0.03] backdrop-blur-md rounded-3xl p-8 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden"
            >
              {/* Soft interior gold highlights */}
              <div className="absolute -right-32 -top-32 w-64 h-64 rounded-full bg-amber-500/5 blur-[85px] pointer-events-none" />
              <div className="absolute -left-32 -bottom-32 w-64 h-64 rounded-full bg-yellow-600/5 blur-[85px] pointer-events-none" />

              <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-[#141414]/90 mb-8 border-b border-black/5 pb-4 flex items-center gap-3">
                <MessageSquare className="w-5.5 h-5.5 text-amber-600" />
                Send a Message
              </h2>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-6 relative z-10">
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3.5 rounded-xl text-sm"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{submitError}</span>
                  </motion.div>
                )}

                {/* Name Form */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-4 px-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Name Details</span>
                    {focusedField === 'name' && (
                      <motion.span layoutId="focusDot" className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    )}
                  </div>
                  <FloatingField
                    id="name"
                    name="name"
                    label="Name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.name && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 flex items-center gap-1 mt-1 font-semibold px-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email Form */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-4 px-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Email Contact</span>
                    {focusedField === 'email' && (
                      <motion.span layoutId="focusDot" className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    )}
                  </div>
                  <FloatingField
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.email && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 flex items-center gap-1 mt-1 font-semibold px-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Phone Number Form */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-4 px-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Phone Number</span>
                    {focusedField === 'phone' && (
                      <motion.span layoutId="focusDot" className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    )}
                  </div>
                  <FloatingField
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.phone && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 flex items-center gap-1 mt-1 font-semibold px-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Message Form */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-4 px-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Inquiry Message</span>
                    {focusedField === 'message' && (
                      <motion.span layoutId="focusDot" className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                    )}
                  </div>
                  <FloatingField
                    id="message"
                    name="message"
                    label="Message"
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    isTextArea={true}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {errors.message && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 flex items-center gap-1 mt-1 font-semibold px-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.message}
                    </motion.p>
                  )}
                </div>

                {/* Swipe-to-Submit Button (Gold & Charcoal Black Theme) */}
                <div className="space-y-2 mt-8">
                  <SwipeButton
                    isSubmitting={isSubmitting}
                    onValidate={validate}
                    onSwipeSuccess={handleFormSubmit}
                  />
                </div>
              </form>

              {/* Success Overlay Modal */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#F8F8F8] z-50 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-100 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)] text-amber-600"
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </motion.div>

                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold tracking-wide text-black/90 mb-2"
                    >
                      Thank You!
                    </motion.h3>

                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-black/60 max-w-sm mb-8 leading-relaxed font-light text-sm"
                    >
                      Your message has been successfully transmitted. Our premium advisors will contact you shortly.
                    </motion.p>

                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      onClick={() => setIsSuccess(false)}
                      className="inline-flex items-center gap-2 border border-black/10 hover:border-amber-600/30 bg-white hover:bg-amber-50 text-black font-semibold rounded-full py-3 px-8 text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-sm hover:shadow"
                    >
                      Send another message
                      <ArrowRight className="w-4 h-4 text-amber-600" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
