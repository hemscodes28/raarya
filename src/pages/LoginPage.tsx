import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import BoomerangVideoBg from '../components/BoomerangVideoBg';

interface AuthPageProps {
  onBack: () => void;
}

export function LoginPage({ onBack }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end pr-6 sm:pr-12 md:pr-20 bg-black overflow-hidden font-sans select-none">
      
      {/* Seamless Boomerang Video Background */}
      <BoomerangVideoBg
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Bottom Blur Overlay (No Gradient Darkening) */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none backdrop-blur-xl"
        style={{
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 45%)'
        }}
      />

      {/* Dark Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-black/20 z-2 pointer-events-none" />

      {/* Back to Home Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 text-xs font-semibold tracking-wider uppercase border border-white/10 backdrop-blur-md animate-blur-fade-up"
        style={{ animationDelay: '0ms' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Right Side Auth Card (3/4th Viewport Height) */}
      <div 
        className="relative z-10 w-full max-w-[460px] h-[80vh] rounded-3xl p-8 sm:p-10 text-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-blur-fade-up custom-scrollbar"
        style={{
          animationDelay: '150ms',
          background: 'rgba(10, 10, 10, 0.45)',
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 64px -16px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Glow Effects in Card Background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Card Header (Logo & Welcome) */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          {/* Logo badge */}
          <div 
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border border-white/10 mb-6 bg-white/5 backdrop-blur-md animate-blur-fade-up"
            style={{ animationDelay: '300ms' }}
          >
            <img
              src="/preset-sites/zenith-realty/logo.png"
              alt="RAARYA"
              className="h-6 w-6 object-contain"
            />
            <span className="text-xs font-semibold tracking-widest uppercase">Raarya Groups</span>
          </div>

          <h2 
            className="text-center text-3xl font-bold tracking-tight animate-blur-fade-up"
            style={{ 
              animationDelay: '400ms',
              fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" 
            }}
          >
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p 
            className="text-center text-white/50 text-xs mt-2 animate-blur-fade-up"
            style={{ animationDelay: '500ms' }}
          >
            {isSignUp ? 'Sign up to discover luxury villa plots' : 'Sign in to access premium listings'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="animate-blur-fade-up" style={{ animationDelay: '550ms' }}>
              <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-1.5 ml-1">
                Full Name
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
                  className="w-full border border-white/10 bg-white/5 rounded-xl px-11 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="animate-blur-fade-up" style={{ animationDelay: '600ms' }}>
            <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-1.5 ml-1">
              Your Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="Enter your email id here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-white/10 bg-white/5 rounded-xl px-11 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="animate-blur-fade-up" style={{ animationDelay: '650ms' }}>
            <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-1.5 ml-1">
              Password
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
                className="w-full border border-white/10 bg-white/5 rounded-xl px-11 py-3.5 pr-12 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-300"
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

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUp && (
            <div className="animate-blur-fade-up" style={{ animationDelay: '700ms' }}>
              <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-1.5 ml-1">
                Confirm Password
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
                  className="w-full border border-white/10 bg-white/5 rounded-xl px-11 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password (Login Only) */}
          {!isSignUp && (
            <div className="flex items-center justify-between mt-1 text-xs text-white/60 animate-blur-fade-up" style={{ animationDelay: '700ms' }}>
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 accent-white cursor-pointer"
                />
                Remember me
              </label>
              <button
                type="button"
                className="font-medium hover:text-white transition-colors hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-xl text-sm font-semibold tracking-wide hover:bg-white/95 active:scale-[0.98] transition-all duration-300 shadow-lg mt-3 animate-blur-fade-up"
            style={{ animationDelay: '750ms' }}
          >
            {isSignUp ? 'Create Account' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6 relative z-10 animate-blur-fade-up" style={{ animationDelay: '800ms' }}>
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Authentication */}
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 animate-blur-fade-up" style={{ animationDelay: '850ms' }}>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2.5 rounded-xl py-3 text-xs font-semibold transition-all duration-300 liquid-glass hover:bg-white/5 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2.5 rounded-xl py-3 text-xs font-semibold transition-all duration-300 liquid-glass hover:bg-white/5 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Toggle Login/Signup Switcher */}
        <p className="text-center text-xs text-white/50 mt-8 relative z-10 animate-blur-fade-up" style={{ animationDelay: '900ms' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white font-semibold hover:underline"
          >
            {isSignUp ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
