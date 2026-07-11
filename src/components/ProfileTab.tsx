import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Camera, Save, KeyRound, Quote } from 'lucide-react';
import { apiUpdateProfile, apiChangePassword } from '../utils/api';

interface ProfileTabProps {
  user: { name: string; email: string; phone?: string; whatsapp?: string; avatar?: string };
  onUserUpdate: (u: any) => void;
}

const RE_QUOTES = [
  { text: "Real estate cannot be lost or stolen, nor can it be carried away.", author: "Franklin D. Roosevelt" },
  { text: "Don't wait to buy real estate. Buy real estate and wait.", author: "Will Rogers" },
  { text: "The best investment on Earth is Earth.", author: "Louis Glickman" },
];

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#141414] placeholder:text-slate-400 outline-none focus:border-[#141414] focus:ring-2 focus:ring-[#141414]/8 transition-all duration-300 bg-white hover:border-slate-300';

export function ProfileTab({ user, onUserUpdate }: ProfileTabProps) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passStatus, setPassStatus] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const quote = RE_QUOTES[Math.floor(Math.random() * RE_QUOTES.length)];
  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : user.email.charAt(0).toUpperCase();
  const firstName = name ? name.split(' ')[0] : 'User';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setProfileStatus(''); setProfileError(''); setProfileLoading(true);
    try {
      const data = await apiUpdateProfile({ email: user.email, name, phone, whatsapp, avatar });
      if (data.success) {
        setProfileStatus('Profile updated successfully!');
        onUserUpdate({ ...user, name, phone, whatsapp, avatar });
      } else {
        setProfileError(data.message || 'Update failed.');
      }
    } catch {
      setProfileError('Unable to connect to server.');
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async () => {
    setPassStatus(''); setPassError(''); 
    if (!oldPass || !newPass || !confirmPass) { setPassError('All password fields are required.'); return; }
    if (newPass !== confirmPass) { setPassError('New passwords do not match.'); return; }
    if (newPass.length < 6) { setPassError('Password must be at least 6 characters.'); return; }
    setPassLoading(true);
    try {
      const data = await apiChangePassword({ email: user.email, oldPassword: oldPass, newPassword: newPass });
      if (data.success) {
        setPassStatus('Password changed successfully!');
        setOldPass(''); setNewPass(''); setConfirmPass('');
      } else {
        setPassError(data.message || 'Password change failed.');
      }
    } catch {
      setPassError('Unable to connect to server.');
    }
    setPassLoading(false);
  };

  return (
    <div className="flex flex-col gap-7 max-w-3xl mx-auto w-full">

      {/* Welcome + Quote Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden bg-[#141414] p-8"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=50')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/90 to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 mb-1">Account</p>
            <h2 className="text-2xl font-medium text-white tracking-tight" style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}>
              Welcome, {firstName}.
            </h2>
            <p className="text-xs text-white/40 mt-1">{user.email}</p>
          </div>
          <blockquote className="relative max-w-xs">
            <Quote className="w-5 h-5 text-white/20 mb-2" />
            <p className="text-sm italic text-white/60 leading-relaxed">"{quote.text}"</p>
            <footer className="text-[10px] text-white/30 font-semibold mt-2 uppercase tracking-wider">— {quote.author}</footer>
          </blockquote>
        </div>
      </motion.div>

      {/* Profile Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#141414] flex items-center justify-center text-white shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#141414] tracking-tight">Personal Information</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Your profile details visible to RAARYA</p>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-7">

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group/avatar shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#141414] flex items-center justify-center text-white font-bold text-2xl border-4 border-slate-100 shadow-md overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <label className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#141414] mb-1">Profile Avatar</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all duration-200 group/upload">
                <Camera className="w-3.5 h-3.5 group-hover/upload:scale-110 transition-transform" />
                Upload Avatar
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-[10px] text-slate-400 mt-1.5">Recommended: 100 × 100 px</p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Full Name <span className="text-rose-400">*</span></label>
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email Address <span className="text-rose-400">*</span></label>
              <input className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed`} value={user.email} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Phone Number <span className="text-rose-400">*</span></label>
              <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9566781809" type="tel" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">WhatsApp Number</label>
              <input className={inputCls} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Same as phone or different" type="tel" />
            </div>
          </div>

          {profileStatus && <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">{profileStatus}</p>}
          {profileError && <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{profileError}</p>}

          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className="self-start flex items-center gap-2 px-6 py-3 bg-[#141414] hover:bg-black text-white text-xs font-bold tracking-wide rounded-xl shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
          >
            {profileLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save & Update
          </button>
        </div>
      </motion.div>

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#141414] tracking-tight">Change Password</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Keep your account secure with a strong password</p>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Old Password</label>
            <input type="password" className={inputCls} value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="••••••••••" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">New Password <span className="text-rose-400">*</span></label>
              <input type="password" className={inputCls} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Confirm Password <span className="text-rose-400">*</span></label>
              <input type="password" className={inputCls} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password" />
            </div>
          </div>

          {passStatus && <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">{passStatus}</p>}
          {passError && <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{passError}</p>}

          <button
            onClick={handlePasswordChange}
            disabled={passLoading}
            className="self-start flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold tracking-wide rounded-xl shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
          >
            {passLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
            Update Password
          </button>
        </div>
      </motion.div>
    </div>
  );
}
