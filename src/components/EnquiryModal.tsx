import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  TrendingUp, 
  Home, 
  Clock, 
  Send, 
  User, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Building2,
  ChevronDown,
  Check
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { apiSendContactMessage } from '../utils/api';

// Custom Swipe to Submit Button Component matching Contact Us Module
interface SwipeSubmitButtonProps {
  isSubmitting: boolean;
  onSwipeSuccess: () => void;
  onValidate: () => boolean;
}

function SwipeSubmitButton({ isSubmitting, onSwipeSuccess, onValidate }: SwipeSubmitButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const thumbWidth = 56; // h-14 = 56px
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
  const progressWidth = useTransform(x, [0, dragMax], [thumbWidth, containerWidth]);
  const textOpacity = useTransform(x, [0, dragMax * 0.6], [1, 0]);

  const handleDragEnd = () => {
    if (x.get() >= dragMax * 0.8) {
      if (onValidate()) {
        animate(x, dragMax, { type: 'spring', stiffness: 400, damping: 30 });
        onSwipeSuccess();
      } else {
        animate(x, 0, { type: 'spring', stiffness: 350, damping: 25 });
      }
    } else {
      animate(x, 0, { type: 'spring', stiffness: 350, damping: 25 });
    }
  };

  const handleDirectClick = () => {
    if (onValidate()) {
      animate(x, dragMax, { type: 'spring', stiffness: 400, damping: 30 });
      onSwipeSuccess();
    }
  };

  useEffect(() => {
    if (!isSubmitting) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  }, [isSubmitting, x]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-14 bg-indigo-50/80 rounded-2xl overflow-hidden border border-indigo-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] flex items-center select-none"
    >
      {/* Slide progress background fill */}
      <motion.div 
        style={{ width: progressWidth }}
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-900 to-indigo-700 opacity-20 pointer-events-none rounded-2xl"
      />

      {/* Floating Swipe Prompt Text */}
      <motion.div 
        style={{ opacity: textOpacity }}
        onClick={handleDirectClick}
        className="absolute inset-y-0 left-14 right-2 flex items-center justify-center cursor-pointer overflow-hidden"
      >
        <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-950 flex items-center justify-center gap-1.5 truncate">
          <span>Swipe or Click to Submit</span>
          <ArrowRight className="w-3.5 h-3.5 animate-pulse text-amber-500 shrink-0" />
        </span>
      </motion.div>

      {/* Slide Handle Thumb */}
      <motion.div
        drag="x"
        dragElastic={0.1}
        dragMomentum={false}
        dragConstraints={{ left: 0, right: dragMax }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="absolute left-0 top-0 bottom-0 w-14 h-14 bg-[#0F172A] hover:bg-black rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_4px_20px_rgba(15,23,42,0.25)] border border-amber-400/40 z-10 text-amber-400 transition-colors"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          >
            <Send className="w-5 h-5 text-amber-400 font-bold" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Custom Luxury Dropdown Menu Component
interface CustomRoleDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

const roleOptions = [
  { label: 'Select your role (Buyer)', value: 'Buyer' },
  { label: 'Investor', value: 'Investor' },
  { label: 'Real Estate Agent', value: 'Real Estate Agent' },
  { label: 'NRI Buyer', value: 'NRI Buyer' },
  { label: 'Other', value: 'Other' },
];

function CustomRoleDropdown({ value, onChange }: CustomRoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = roleOptions.find(o => o.value === value) || roleOptions[0];

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium flex items-center justify-between outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all cursor-pointer shadow-sm"
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-950' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 overflow-hidden"
          >
            {roleOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
  propertyPrice?: string;
  propertyLocation?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccessSubmitted?: () => void;
}

export function EnquiryModal({
  isOpen,
  onClose,
  propertyName = 'General Property Inquiry',
  propertyPrice,
  propertyLocation,
  userEmail = '',
  userName = '',
  userPhone = '',
  onSuccessSubmitted
}: EnquiryModalProps) {
  const [reason, setReason] = useState<'INVESTMENT' | 'SELF USE'>('SELF USE');
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(userPhone);
  const [email, setEmail] = useState(userEmail);
  const [message, setMessage] = useState('');
  const [whoAreYou, setWhoAreYou] = useState('Buyer');
  const [planningToBuy, setPlanningToBuy] = useState<'< 3 MONTHS' | '< 6 MONTHS' | '6 MONTHS+'>('< 3 MONTHS');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (userName) setName(userName);
    if (userPhone) setPhone(userPhone);
    if (userEmail) setEmail(userEmail);
  }, [userName, userPhone, userEmail]);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    const currentUserStored = (() => {
      try {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
      } catch { return null; }
    })();

    const effectiveEmail = email.trim() || currentUserStored?.email || 'customer@raaryaproperties.com';

    const payload = {
      propertyName,
      name: name.trim(),
      phone: phone.trim(),
      email: effectiveEmail,
      ownerEmail: effectiveEmail, // Ensures enquiry maps into user's Dashboard -> Enquiry tab!
      reason,
      whoAreYou,
      planningToBuy,
      message: message.trim() || `Enquiry for ${propertyName} (${propertyPrice || ''} ${propertyLocation ? 'at ' + propertyLocation : ''})`
    };

    try {
      const res = await apiSendContactMessage(payload);
      if (res.success) {
        setIsSuccess(true);
        if (onSuccessSubmitted) onSuccessSubmitted();
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2400);
      } else {
        setError(res.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setError('Failed to submit enquiry. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm font-sans overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[88vh] sm:max-h-[85vh] bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col transform-gpu"
        >
          {/* HEADER BANNER WITH LUXURY INDIGO/GOLD THEME */}
          <div className="relative bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] p-5 sm:p-7 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 mb-2 inline-flex items-center gap-1.5 shadow-sm">
                <Building2 className="w-3 h-3 text-amber-400" />
                <span>{propertyName !== 'General Property Inquiry' ? propertyName : 'RAARYA PROPERTIES'}</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2" style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}>
                Send an Enquiry
              </h2>
              <p className="text-xs text-slate-300/80 mt-1 font-medium">
                We'll get back to you within 1 business day
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/10 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SUCCESS OVERLAY */}
          {isSuccess ? (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-white text-slate-900 min-h-[400px]">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 animate-bounce shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Enquiry Sent Successfully!</h3>
              <p className="text-sm text-slate-600 mt-2 max-w-md">
                Thank you for inquiring about <strong className="text-indigo-950 font-bold">{propertyName}</strong>. Our backend team & advisor will contact you shortly.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs text-indigo-950 font-bold bg-indigo-50 px-4 py-2.5 rounded-2xl border border-indigo-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Saved directly to your Profile ➔ Enquiry Feed!</span>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-8 bg-white flex-1 overflow-y-auto pb-10 sm:pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                
                {/* LEFT COLUMN: YOUR DETAILS */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <User className="w-4 h-4 text-indigo-900" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      YOUR DETAILS
                    </span>
                  </div>

                  {/* REASON TO BUY */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      REASON TO BUY
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setReason('INVESTMENT')}
                        className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                          reason === 'INVESTMENT'
                            ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border-indigo-900 shadow-md shadow-indigo-950/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-100'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>INVESTMENT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReason('SELF USE')}
                        className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                          reason === 'SELF USE'
                            ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border-indigo-900 shadow-md shadow-indigo-950/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-100'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span>SELF USE</span>
                      </button>
                    </div>
                  </div>

                  {/* YOUR NAME */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      YOUR NAME *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* MOBILE NUMBER */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      MOBILE NUMBER *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all font-medium tracking-wide font-mono"
                      required
                    />
                  </div>

                  {/* EMAIL ADDRESS */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      EMAIL ADDRESS (OPTIONAL)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: ADDITIONAL INFO */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Info className="w-4 h-4 text-indigo-900" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      ADDITIONAL INFO
                    </span>
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      MESSAGE
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Share any specific requirements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all resize-none font-medium"
                    />
                  </div>

                  {/* WHO ARE YOU? CUSTOM LUXURY DROPDOWN */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      WHO ARE YOU?
                    </label>
                    <CustomRoleDropdown
                      value={whoAreYou}
                      onChange={(newRole) => setWhoAreYou(newRole)}
                    />
                  </div>

                  {/* WHEN PLANNING TO BUY? */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      WHEN PLANNING TO BUY?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['< 3 MONTHS', '< 6 MONTHS', '6 MONTHS+'] as const).map((timeOption) => (
                        <button
                          key={timeOption}
                          type="button"
                          onClick={() => setPlanningToBuy(timeOption)}
                          className={`py-2.5 px-3.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
                            planningToBuy === timeOption
                              ? 'bg-indigo-950 text-white border-indigo-950 font-extrabold shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-indigo-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeOption}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs font-semibold text-rose-600 mt-4 text-center bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {error}
                </p>
              )}

              {/* SLIDE TO SUBMIT BUTTON (MATCHING CONTACT US MODULE) */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                <SwipeSubmitButton
                  isSubmitting={isLoading}
                  onValidate={validateForm}
                  onSwipeSuccess={handleSubmit}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
