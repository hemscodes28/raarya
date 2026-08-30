import { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, ArrowRight, RotateCcw, Phone } from "lucide-react";
import { motion } from "motion/react";
import { sendFirebaseSms } from "../utils/firebaseClient";

interface OtpVerificationProps {
  phone: string;
  mockOtp?: string;
  onVerify: (verifiedPhone: string) => void;
  onCancel: () => void;
}

export function OtpVerification({ 
  phone: initialPhone, 
  onVerify, 
  onCancel 
}: OtpVerificationProps) {
  const [phone, setPhone] = useState<string>(initialPhone || "");
  const [tempPhone, setTempPhone] = useState<string>("");
  const [isPhoneMissing, setIsPhoneMissing] = useState<boolean>(!initialPhone);
  
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  
  const [timer, setTimer] = useState<number>(30);
  const [error, setError] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmationResultRef = useRef<any>(null);

  // Trigger Firebase SMS sending when phone number is available
  useEffect(() => {
    if (phone && !isPhoneMissing) {
      triggerFirebaseSms();
    }
  }, [phone, isPhoneMissing]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timer > 0 && !isPhoneMissing) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isPhoneMissing]);

  // Dispatch Real SMS via Firebase SMS Gateway
  const triggerFirebaseSms = async () => {
    if (!phone) return;
    setIsSending(true);
    setTimer(30);
    setError("");
    setOtpValues(Array(6).fill(""));

    try {
      const result = await sendFirebaseSms(phone, "recaptcha-container");

      if (result.success && result.confirmationResult) {
        confirmationResultRef.current = result.confirmationResult;
        console.log("Firebase SMS dispatched to phone messenger!");
      } else {
        console.warn("Firebase App Check warning on localhost:", result.error);
        // Fallback to seamless backend verification code so login is never blocked
        const { apiSendOtp } = await import("../utils/api");
        await apiSendOtp(phone);
      }
    } catch (err: any) {
      console.error("Firebase SMS error:", err);
      const { apiSendOtp } = await import("../utils/api");
      await apiSendOtp(phone);
    } finally {
      setIsSending(false);
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
      setError("Please enter the complete 6-digit code sent to your phone.");
      return;
    }
    const enteredOtp = otpValues.join("");
    setError("");
    setIsVerifying(true);
    
    try {
      if (confirmationResultRef.current) {
        await confirmationResultRef.current.confirm(enteredOtp);
        setIsVerifying(false);
        onVerify(phone);
        return;
      }

      // Fallback local verify
      const { apiVerifyOtp } = await import("../utils/api");
      const res = await apiVerifyOtp(phone, enteredOtp);
      if (res.success) {
        setIsVerifying(false);
        onVerify(phone);
      } else {
        setError(res.message || "Invalid security code. Please check your SMS inbox and try again.");
        setOtpValues(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        setIsVerifying(false);
      }
    } catch (err: any) {
      console.error("Firebase OTP Verification Error:", err);
      setError("Invalid security code. Please check your SMS inbox and try again.");
      setOtpValues(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setIsVerifying(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPhone || tempPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setPhone(tempPhone);
    setIsPhoneMissing(false);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      
      {/* Invisible Recaptcha Container for Firebase Phone Auth */}
      <div id="recaptcha-container" className="fixed bottom-0 right-0 z-0 opacity-0 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
      >
        <button 
          onClick={onCancel}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {isPhoneMissing ? (
          /* Phone Input Screen */
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Enter Phone Number</h3>
            <p className="text-xs text-white/50 mt-1 mb-6 max-w-xs">
              To secure your account, please enter your mobile number. A 6-digit security code will be sent to your phone messenger via Firebase SMS.
            </p>

            <form onSubmit={handlePhoneSubmit} className="w-full flex flex-col gap-4">
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono tracking-wider"
                autoFocus
              />

              {error && <p className="text-xs font-medium text-rose-400">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-semibold text-xs rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Send Firebase SMS Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* OTP Verification Screen */
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-white tracking-tight">Firebase SMS Verification</h3>
            <p className="text-xs text-white/50 mt-1 max-w-xs">
              Enter the 6-digit verification code sent to your mobile phone inbox
            </p>
            
            <div className="flex items-center gap-2 mt-2 mb-6">
              <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                +91 {phone}
              </span>
              <button 
                onClick={() => setIsPhoneMissing(true)}
                className="text-[11px] text-indigo-400 hover:underline font-medium"
              >
                Change
              </button>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`w-11 h-12 rounded-xl text-center font-mono text-lg font-bold transition-all outline-none border ${
                    digit 
                      ? "bg-white/15 border-white text-white shadow-md shadow-white/5" 
                      : "bg-white/5 border-white/10 text-white/40 focus:border-white/40 focus:bg-white/10"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-xs font-medium text-rose-400 mb-4 animate-shake">{error}</p>}

            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full py-3.5 bg-gradient-to-r from-white via-slate-100 to-slate-200 text-black font-bold text-xs rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {isVerifying ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Timer */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/40">
              {timer > 0 ? (
                <span>Resend code in <strong className="text-white/80 font-mono">{timer}s</strong></span>
              ) : (
                <button
                  onClick={triggerFirebaseSms}
                  disabled={isSending}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                  <span>Resend Firebase SMS Code</span>
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
