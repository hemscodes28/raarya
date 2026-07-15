import { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, ArrowRight, RotateCcw, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OtpVerificationProps {
  phone: string;
  mockOtp?: string;
  onVerify: (verifiedPhone: string) => void;
  onCancel: () => void;
}

export function OtpVerification({ 
  phone: initialPhone, 
  mockOtp: mockOtpProp, 
  onVerify, 
  onCancel 
}: OtpVerificationProps) {
  const [phone, setPhone] = useState<string>(initialPhone || "");
  const [tempPhone, setTempPhone] = useState<string>("");
  const [isPhoneMissing, setIsPhoneMissing] = useState<boolean>(!initialPhone);
  
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  
  const [timer, setTimer] = useState<number>(30);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Trigger OTP sending when phone number is available
  useEffect(() => {
    if (phone && !isPhoneMissing) {
      if (mockOtpProp) {
        setGeneratedOtp(mockOtpProp);
        setShowToast(true);
      } else {
        generateAndSendOtp();
      }
    }
  }, [phone, isPhoneMissing, mockOtpProp]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timer > 0 && !isPhoneMissing) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isPhoneMissing]);

  // Trigger backend OTP SMS
  const generateAndSendOtp = async () => {
    if (!phone) return;
    const { apiSendOtp } = await import("../utils/api");
    setTimer(30);
    setError("");
    setOtpValues(Array(6).fill(""));
    
    try {
      const res = await apiSendOtp(phone);
      if (res.success) {
        if (res.isMocked && res.otp) {
          setGeneratedOtp(res.otp);
          setShowToast(true);
        } else {
          setGeneratedOtp("REAL_SMS_FLOW");
          setShowToast(false);
        }
      } else {
        setError(res.message || "Failed to send verification code.");
      }
    } catch (err) {
      setError("Unable to connect to verification server.");
    }
    
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleInputChange = (value: string, index: number) => {
    if (value && isNaN(Number(value))) return; // Only allow numbers

    const newValues = [...otpValues];
    newValues[index] = value.substring(value.length - 1); // Only keep the last digit
    setOtpValues(newValues);

    // Auto-focus next input box
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otpValues.some(val => val === "")) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    const enteredOtp = otpValues.join("");
    setError("");
    
    try {
      const { apiVerifyOtp } = await import("../utils/api");
      const res = await apiVerifyOtp(phone, enteredOtp);
      if (res.success) {
        onVerify(phone);
      } else {
        setError(res.message || "Invalid security code. Please check and try again.");
        setOtpValues(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Invalid security code. Please check and try again.");
      setOtpValues(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  // 1. Phone Input Form (If user doesn't have a phone number, like on first Google Login)
  if (isPhoneMissing) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute right-5 top-5 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="mx-auto w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white mb-5">
            <Phone className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-lg font-bold text-white tracking-wide">Enter Phone Number</h3>
          <p className="text-xs text-white/50 mt-2 px-2 leading-relaxed mb-6">
            To secure your account, please enter your mobile number. A 6-digit security code will be sent to this number.
          </p>

          {/* Error Message */}
          {error && (
            <p className="text-[11px] font-semibold text-rose-500 mb-4">
              {error}
            </p>
          )}

          {/* Phone Input */}
          <div className="mb-6 relative">
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={15}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white focus:bg-white/10 text-center text-md font-bold text-white rounded-xl py-3 outline-none focus:ring-1 focus:ring-white transition-all duration-300 shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={async () => {
              if (tempPhone.length < 10) {
                setError("Please enter a valid phone number (at least 10 digits).");
                return;
              }
              setError("");
              
              const { apiSendOtp } = await import("../utils/api");
              try {
                const res = await apiSendOtp(tempPhone);
                if (res.success) {
                  if (res.isMocked && res.otp) {
                    setGeneratedOtp(res.otp);
                    setShowToast(true);
                  } else {
                    setGeneratedOtp("REAL_SMS_FLOW");
                    setShowToast(false);
                  }
                  setPhone(tempPhone);
                  setIsPhoneMissing(false);
                } else {
                  setError(res.message || "Failed to send verification code.");
                }
              } catch (err) {
                setError("Failed to initialize phone verification.");
              }
            }}
            className="w-full bg-white text-black py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Send Verification Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  // 2. 6-Digit OTP Code Form
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] px-4">
      {/* Toast simulated SMS notification banner */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 max-w-md w-full bg-[#18181b] border border-emerald-500/30 rounded-2xl p-4 shadow-[0_10px_30px_rgba(16,185,129,0.15)] flex items-start gap-3.5 z-[10000]"
          >
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Dev SMS Notification</span>
                <button onClick={() => setShowToast(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 font-semibold">
                OTP sent successfully to phone number: <span className="text-zinc-200">{phone}</span>.
              </p>
              <div className="mt-2.5 flex items-center justify-between bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Verification Code:</span>
                <span className="text-sm font-black tracking-[0.2em] text-white bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg select-all">
                  {generatedOtp}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-5 top-5 text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Badge Icon */}
        <div className="mx-auto w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white mb-5">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-lg font-bold text-white tracking-wide">Two-Factor Authentication</h3>
        <p className="text-xs text-white/50 mt-2 px-2 leading-relaxed">
          To protect your Raarya Groups portal account, we have sent a 6-digit security code to your phone number:
          <span className="block text-white font-semibold mt-1 truncate">{phone}</span>
        </p>

        {/* 6 Digit Inputs */}
        <div className="flex gap-2.5 justify-center my-6">
          {otpValues.map((val, idx) => (
            <input
              key={idx}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              value={val}
              ref={(el) => (inputRefs.current[idx] = el)}
              onChange={(e) => handleInputChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-14 bg-white/5 border border-white/10 hover:border-white/20 focus:border-white focus:bg-white/10 text-center text-lg font-bold text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-white transition-all duration-300 shadow-sm"
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-[11px] font-semibold text-rose-500 mb-4 animate-shake">
            {error}
          </p>
        )}

        {/* Submit Verify CTA */}
        <button
          onClick={handleVerify}
          className="w-full bg-white text-black py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <span>Verify & Unlock Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Resend and Actions */}
        <div className="mt-5 flex justify-between items-center text-xs border-t border-white/5 pt-4">
          <span className="text-white/40">Didn't receive the code?</span>
          <button
            onClick={generateAndSendOtp}
            disabled={timer > 0}
            className="flex items-center gap-1 text-white font-semibold hover:underline disabled:text-white/20 disabled:no-underline transition-colors duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{timer > 0 ? `Resend (${timer}s)` : "Resend Code"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
