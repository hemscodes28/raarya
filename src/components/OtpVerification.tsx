import { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, ArrowRight, RotateCcw, Phone, Mail } from "lucide-react";
import { motion } from "motion/react";
import { sendFirebaseSms } from "../utils/firebaseClient";

interface OtpVerificationProps {
  phone: string;
  email?: string;
  mockOtp?: string;
  onVerify: (verifiedTarget: string) => void;
  onCancel: () => void;
}

export function OtpVerification({ 
  phone: initialPhone, 
  email: initialEmail,
  onVerify, 
  onCancel 
}: OtpVerificationProps) {
  const [phone, setPhone] = useState<string>(initialPhone || "");
  const [email, setEmail] = useState<string>(initialEmail || "");
  const [tempInput, setTempInput] = useState<string>("");
  const [isTargetMissing, setIsTargetMissing] = useState<boolean>(!initialPhone && !initialEmail);
  
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [simulatedOtp, setSimulatedOtp] = useState<string>("");
  
  const [timer, setTimer] = useState<number>(30);
  const [error, setError] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmationResultRef = useRef<any>(null);

  // Trigger OTP sending when phone or email is available
  useEffect(() => {
    if ((phone || email) && !isTargetMissing) {
      triggerOtpSend();
    }
  }, [phone, email, isTargetMissing]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (timer > 0 && !isTargetMissing) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isTargetMissing]);

  // Dispatch OTP via Email or Firebase SMS
  const triggerOtpSend = async () => {
    if (!phone && !email) return;
    setIsSending(true);
    setTimer(30);
    setError("");
    setSimulatedOtp("");
    setOtpValues(Array(6).fill(""));

    try {
      // 1. If phone is present without email, attempt Firebase SMS
      if (phone && !email) {
        const result = await sendFirebaseSms(phone, "recaptcha-container");
        if (result.success && result.confirmationResult) {
          confirmationResultRef.current = result.confirmationResult;
          console.log("Firebase SMS dispatched!");
          setIsSending(false);
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
          return;
        }
      }

      // 2. Call backend /api/send-otp (handles Nodemailer HTML Email & SMS)
      const { apiSendOtp } = await import("../utils/api");
      const res = await apiSendOtp(phone, email);
      if (res.success) {
        if (res.isMocked && res.otp) {
          setSimulatedOtp(res.otp);
        }
      } else {
        setError(res.message || "Failed to send verification code.");
      }
    } catch (err: any) {
      console.error("OTP send error:", err);
      setError("Unable to connect to authentication server.");
    } finally {
      setIsSending(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
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
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    const enteredOtp = otpValues.join("");
    setError("");
    setIsVerifying(true);
    
    try {
      if (confirmationResultRef.current) {
        await confirmationResultRef.current.confirm(enteredOtp);
        setIsVerifying(false);
        onVerify(email || phone);
        return;
      }

      // Call backend apiVerifyOtp
      const { apiVerifyOtp } = await import("../utils/api");
      const res = await apiVerifyOtp(phone, enteredOtp, email);
      if (res.success) {
        setIsVerifying(false);
        onVerify(email || phone);
      } else {
        setError(res.message || "Invalid security code. Please check your inbox and try again.");
        setOtpValues(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        setIsVerifying(false);
      }
    } catch (err: any) {
      console.error("OTP Verification Error:", err);
      setError("Invalid security code. Please check your inbox and try again.");
      setOtpValues(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setIsVerifying(false);
    }
  };

  const handleTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempInput) {
      setError("Please enter a valid mobile number or email address.");
      return;
    }
    if (tempInput.includes("@")) {
      setEmail(tempInput);
    } else {
      setPhone(tempInput.replace(/\D/g, ""));
    }
    setIsTargetMissing(false);
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

        {isTargetMissing ? (
          /* Input Screen */
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Security Authentication</h3>
            <p className="text-xs text-white/50 mt-1 mb-6 max-w-xs">
              Enter your email address or mobile number to receive a 6-digit verification security code.
            </p>

            <form onSubmit={handleTargetSubmit} className="w-full flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter email or 10-digit phone"
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white placeholder:text-white/30 outline-none focus:border-amber-400/40 focus:bg-white/10 transition-all font-mono"
                autoFocus
              />

              {error && <p className="text-xs font-medium text-rose-400">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Send Security Code</span>
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
            
            <h3 className="text-lg font-bold text-white tracking-tight">
              {email ? "Email Security Verification" : "Mobile OTP Verification"}
            </h3>
            <p className="text-xs text-white/50 mt-1 max-w-xs">
              {email 
                ? "Enter the 6-digit security code sent to your email inbox" 
                : "Enter the 6-digit security code sent to your mobile phone"}
            </p>
            
            <div className="flex items-center gap-2 mt-2.5 mb-5">
              {email ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-bold">{email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono font-bold">+91 {phone}</span>
                </div>
              )}
              <button 
                onClick={() => setIsTargetMissing(true)}
                className="text-[11px] text-amber-400 hover:underline font-medium ml-1"
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
                      ? "bg-amber-400/15 border-amber-400 text-amber-300 shadow-md shadow-amber-400/10" 
                      : "bg-white/5 border-white/10 text-white/40 focus:border-amber-400/40 focus:bg-white/10"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-xs font-medium text-rose-400 mb-4 animate-shake">{error}</p>}

            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-black font-bold text-xs rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Code & Login</span>
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
                  onClick={triggerOtpSend}
                  disabled={isSending}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                  <span>Resend Security Code</span>
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

