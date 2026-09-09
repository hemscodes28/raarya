import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import BoomerangVideoBg from '../components/BoomerangVideoBg';
import { OtpVerification } from '../components/OtpVerification';
import { apiSignup, apiLogin } from '../utils/api';
import { signInWithGoogle } from '../utils/firebaseClient';

interface AuthPageProps {
  onBack: () => void;
  onSuccess: (user: any, mockOtp?: string) => void;
}

export function LoginPage({ onBack, onSuccess }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpTargetEmail, setOtpTargetEmail] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rememberUser');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) {
          setPhone(parsed.phone);
          setLoginInput(parsed.phone);
        }
      }
    } catch {}
  }, []);

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        setPendingUser(res.user);
        setOtpTargetEmail(res.user.email || '');
        setOtpTargetPhone(res.user.phone || '');
        setSuccess('Google authenticated! Please enter the verification code sent to your email.');
        setShowOtpModal(true);
      } else {
        setError(res.error?.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      setError('Unable to authenticate with Google.');
    }
    setIsLoading(false);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = resetEmail || email || (loginInput.includes('@') ? loginInput : '');
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid email address to receive reset instructions.');
      return;
    }
    setError('');
    setSuccess('');
    setResetSending(true);
    try {
      const { sendPasswordReset } = await import('../utils/firebaseClient');
      const res = await sendPasswordReset(targetEmail);
      if (res.success) {
        setSuccess(res.message || `Password reset instructions & code sent to ${targetEmail}. Please check your inbox!`);
        setResetStep(2);
      } else {
        setError(res.message || 'Unable to send reset instructions.');
      }
    } catch (err) {
      setError('Error sending password reset request.');
    } finally {
      setResetSending(false);
    }
  };

  const handleResetPasswordConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = resetEmail || email || (loginInput.includes('@') ? loginInput : '');
    if (!targetEmail || !resetCode || !newPassword) {
      setError('Please enter the 6-digit code sent to your email and your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    setError('');
    setSuccess('');
    setResetSending(true);
    try {
      const { apiResetPassword } = await import('../utils/api');
      const res = await apiResetPassword({ email: targetEmail, code: resetCode, newPassword });
      if (res.success) {
        setSuccess(res.message || 'Password updated successfully!');
        setTimeout(() => {
          setIsForgotPassword(false);
          setResetStep(1);
          setResetCode('');
          setNewPassword('');
          setSuccess('Password updated! You can now sign in with your new password.');
        }, 1500);
      } else {
        setError(res.message || 'Invalid code or failed to reset password.');
      }
    } catch (err) {
      setError('Unable to reset password.');
    } finally {
      setResetSending(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (isSignUp) {
      if (!name || !phone || !email || !password || !confirmPassword) {
        setError('Name, Phone, Email, and Password are all required.');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiSignup({ name, phone, email, password });
        if (data.success && data.user) {
          setPendingUser(data.user);
          setOtpTargetPhone(data.user.phone || phone);
          setOtpTargetEmail(data.user.email || email);
          setShowOtpModal(true);
        } else {
          setError(data.message || 'Signup failed.');
        }
      } catch (err) {
        setError('Unable to connect to the authentication server.');
      }
    } else {
      const targetVal = email || phone || loginInput;
      if (!targetVal || !password) {
        setError('Please enter your Phone Number or Email Address and Password.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiLogin({ phone: targetVal, password });
        if (data.success && data.user) {
          const finalEmail = targetVal.includes('@') ? targetVal : (data.user.email || email || '');
          const updatedUser = { ...data.user, email: finalEmail || data.user.email };
          setPendingUser(updatedUser);
          setOtpTargetPhone(data.user.phone || phone);
          setOtpTargetEmail(finalEmail);
          setShowOtpModal(true);
          if (rememberMe) {
            localStorage.setItem('rememberUser', JSON.stringify({ phone: targetVal }));
          } else {
            localStorage.removeItem('rememberUser');
          }
        } else {
          setError(data.message || 'Login failed.');
        }
      } catch (err) {
        setError('Unable to connect to the authentication server.');
      }
    }
    setIsLoading(false);
  };

  const handleOtpVerified = () => {
    setShowOtpModal(false);
    setSuccess('OTP Verified! Accessing your account...');
    setTimeout(() => {
      onSuccess(pendingUser);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-start lg:justify-center lg:items-end p-4 sm:p-6 lg:pr-24 bg-black overflow-y-auto font-sans select-none custom-scrollbar">
      
      {/* Seamless Boomerang Video Background */}
      <BoomerangVideoBg
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Bottom Gradient Overlay (Fast GPU Render) */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"
      />

      {/* Dark Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-black/30 z-2 pointer-events-none" />

      {/* Back to Home Button Header Container (Cleanly separated on mobile, fixed top-left on desktop) */}
      <div className="w-full lg:absolute lg:top-7 lg:left-7 z-50 flex items-center justify-between mb-3 lg:mb-0 shrink-0 pt-2 lg:pt-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-white/90 hover:text-white bg-white/10 hover:bg-white/20 transition-all duration-300 text-xs font-bold tracking-wider uppercase border border-white/20 backdrop-blur-md cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      {/* Crisp, Instant Luxury Auth Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[460px] h-auto rounded-3xl p-5 sm:p-7 text-white shadow-2xl flex flex-col justify-between overflow-hidden my-auto my-4 sm:my-6 shrink-0"
        style={{
          background: 'rgba(12, 12, 14, 0.75)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 32px 80px -16px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Glow Effects in Card Background */}
        <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        {/* Card Header (Logo & Welcome) */}
        <div className="flex flex-col items-center mb-3 relative z-10">
          {/* Logo badge */}
          <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-white/15 mb-2 bg-white/5 backdrop-blur-md">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="RAARYA"
              className="h-5 w-5 object-contain"
            />
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-200">Raarya Groups</span>
          </div>

          <h2 
            className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}
          >
            {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Your Account' : 'Welcome Back')}
          </h2>
          <p className="text-center text-white/60 text-xs mt-1">
            {isForgotPassword 
              ? 'Enter your registered email address to receive reset instructions' 
              : (isSignUp ? 'Sign up to discover luxury villa plots' : 'Sign in to access premium listings')}
          </p>
        </div>

        {/* Auth Form or Forgot Password Form */}
        {isForgotPassword ? (
          <form onSubmit={resetStep === 1 ? handleForgotPasswordSubmit : handleResetPasswordConfirm} className="flex flex-col gap-3 relative z-10 my-2">
            {error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-2.5 rounded-xl">
                {success}
              </div>
            )}

            {/* Email Address Field */}
            <div>
              <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                Registered Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={resetEmail || email || (loginInput.includes('@') ? loginInput : '')}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetStep === 2}
                  className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-300 disabled:opacity-60"
                  required
                  autoFocus={resetStep === 1}
                />
              </div>
            </div>

            {/* Step 2 Fields: 6-Digit Code & New Password */}
            {resetStep === 2 && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-300 uppercase tracking-widest mb-1 ml-1">
                    6-Digit Security Code <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code from email"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full border border-amber-400/40 bg-amber-400/5 rounded-xl px-11 py-2.5 text-xs text-amber-200 tracking-widest font-mono placeholder:text-white/35 outline-none focus:border-amber-400 focus:bg-white/10 transition-all duration-300"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                    New Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 pr-12 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={resetSending}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold py-3.5 rounded-xl text-xs tracking-wide hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-amber-500/20 mt-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {resetSending ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : resetStep === 1 ? (
                'Send Reset Code & Instructions'
              ) : (
                'Update Password & Sign In'
              )}
            </button>

            {resetStep === 2 && (
              <button
                type="button"
                onClick={() => setResetStep(1)}
                className="text-[11px] text-amber-300 hover:underline text-center cursor-pointer"
              >
                Resend Reset Code
              </button>
            )}

            <button
              type="button"
              onClick={() => { setIsForgotPassword(false); setResetStep(1); setError(''); setSuccess(''); }}
              className="w-full py-2.5 text-xs text-white/60 hover:text-white transition-colors text-center cursor-pointer mt-1"
            >
              ← Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 relative z-10">
            
            {error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-2.5 rounded-xl">
                {success}
              </div>
            )}
            
            <div className="flex flex-col gap-2.5 max-h-[calc(100vh-280px)] sm:max-h-none overflow-y-auto custom-scrollbar pr-0.5">
              {/* Name Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Login Input Fields (Separate Phone & Email Entries) */}
              {!isSignUp ? (
                <>
                  {/* Phone Number Entry (Login) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                      Phone Number <span className="text-white/40 lowercase font-normal">(or enter email below)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        placeholder="Enter registered mobile number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ''));
                          if (e.target.value) setLoginInput(e.target.value.replace(/\D/g, ''));
                        }}
                        maxLength={15}
                        className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Email Address Entry (Login) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                      Email Address <span className="text-white/40 lowercase font-normal">(or enter phone above)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="Enter registered email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (e.target.value) setLoginInput(e.target.value);
                        }}
                        className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-300"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Phone Field (Sign Up) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        maxLength={15}
                        className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Email Field (Sign Up) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-300"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password here"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 pr-12 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isSignUp && password.length > 0 && password.length < 6 && (
                  <p className="mt-1 ml-1 text-[10px] font-semibold text-amber-400 flex items-center gap-1.5 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Password must be at least 6 characters ({6 - password.length} more needed)
                  </p>
                )}
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-1 ml-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-white/12 bg-white/5 rounded-xl px-11 py-2.5 text-xs text-white placeholder:text-white/35 outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password (Login Only) */}
              {!isSignUp && (
                <div className="flex items-center justify-between mt-0.5 text-xs text-white/70">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 accent-amber-500 cursor-pointer"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                    className="font-medium hover:text-amber-200 transition-colors hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold py-3 rounded-xl text-xs tracking-wide hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-amber-500/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                isSignUp ? 'Create Account' : 'Login'
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-3 relative z-10">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Authentication */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center gap-2.5 rounded-xl py-2.5 text-xs font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Toggle Login/Signup Switcher */}
        <p className="text-center text-xs text-white/60 mt-4 relative z-10">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-amber-300 font-bold hover:underline cursor-pointer ml-1"
          >
            {isSignUp ? 'Login' : 'Register'}
          </button>
        </p>
      </motion.div>

      {showOtpModal && (
        <OtpVerification
          phone={otpTargetPhone || phone}
          email={otpTargetEmail || email || pendingUser?.email}
          onVerify={handleOtpVerified}
          onCancel={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
}
