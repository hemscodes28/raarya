import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutGrid, User as UserIcon, MessageSquare, PlusCircle,
  LogOut, X, Building2, Clock, CheckCircle2, ChevronRight,
  Search, MapPin, Phone, MessageCircle, Home, ArrowUpRight,
  Sparkles, ShieldCheck
} from 'lucide-react';
import { ProfileTab } from './ProfileTab';
import { EnquiryTab } from './EnquiryTab';
import { AddPropertyTab } from './AddPropertyTab';
import { apiGetProperties } from '../utils/api';

interface UserDashboardProps {
  user: { name: string; email: string; phone?: string; whatsapp?: string; avatar?: string };
  onClose: () => void;
  onLogout: () => void;
  onUserUpdate: (u: any) => void;
}

const MENU = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'Profile', label: 'Profile', icon: UserIcon },
  { id: 'Enquiry', label: 'Enquiry', icon: MessageSquare },
  { id: 'Add Property', label: 'Add Property', icon: PlusCircle },
];

// ─── DASHBOARD HOME ────────────────────────────────────────────────────────────
function DashboardHome({ user }: { user: any }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const firstName = user.name ? user.name.split(' ')[0] : 'User';

  useEffect(() => {
    apiGetProperties(user.email)
      .then(d => { if (d.success) setProperties(d.properties || []); })
      .catch(() => {});
  }, [user.email]);

  const filtered = properties.filter(p =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { 
      label: 'Your Listings', 
      value: properties.length, 
      sub: 'Total active listings', 
      icon: Building2, 
      color: 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100/40', 
      iconColor: 'text-emerald-600 bg-emerald-100/80 ring-4 ring-emerald-50', 
      accent: 'text-emerald-600 group-hover:translate-x-1' 
    },
    { 
      label: 'Pending', 
      value: properties.filter(p => p.status === 'Pending').length, 
      sub: 'Awaiting verification review', 
      icon: Clock, 
      color: 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-100 hover:border-amber-300 hover:shadow-amber-100/40', 
      iconColor: 'text-amber-600 bg-amber-100/80 ring-4 ring-amber-50', 
      accent: 'text-amber-600 group-hover:translate-x-1' 
    },
    { 
      label: 'Sold', 
      value: properties.filter(p => p.sold).length, 
      sub: 'Successfully closed deals', 
      icon: CheckCircle2, 
      color: 'bg-gradient-to-br from-rose-50 to-pink-50/50 border-rose-100 hover:border-rose-300 hover:shadow-rose-100/40', 
      iconColor: 'text-rose-600 bg-rose-100/80 ring-4 ring-rose-50', 
      accent: 'text-rose-600 group-hover:translate-x-1' 
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden bg-[#141414] p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 shadow-xl border border-white/[0.08]"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=40')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#141414] via-[#141414]/95 to-[#141414]/70" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
            <Sparkles className="w-3 h-3 text-amber-400" /> Premium Account
          </div>
          <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight" style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}>
            Welcome, {firstName}.
          </h2>
          <p className="text-xs text-white/50 mt-1.5 max-w-sm">Your complete real estate dashboard. Manage listings, track enquiries and grow your portfolio.</p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Active Email Address</p>
            <p className="text-xs text-white/60 font-semibold">{user.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative border ${s.color} rounded-3xl p-6 cursor-default hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden bg-white`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/40 transition-all duration-300 rounded-3xl pointer-events-none" />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-slate-500">{s.label}</p>
                  <div className={`w-10 h-10 rounded-2xl ${s.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-5xl font-black text-[#141414] tracking-tight">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">{s.sub}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-bold ${s.accent} transition-transform duration-300`}>
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Listings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
          <div>
            <h3 className="text-base font-bold text-[#141414] tracking-tight">New Listings</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search property name or status…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#141414] placeholder:text-slate-400 outline-none focus:border-[#141414] focus:bg-white focus:ring-4 focus:ring-[#141414]/5 transition-all duration-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {['Listing Name', 'Location', 'Property Type', 'Status', 'Sold Status', 'Action'].map(col => (
                  <th key={col} className="px-8 py-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                        <MapPin className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500">No properties listed yet</p>
                        <p className="text-xs text-slate-400 mt-1">Your listings will appear here once you add them to the system.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={i} className="group/row hover:bg-slate-50/40 transition-colors duration-200">
                    <td className="px-8 py-5 text-xs font-bold text-[#141414] max-w-[200px] truncate" title={p.title}>{p.title || '-'}</td>
                    <td className="px-8 py-5 text-xs text-slate-600 font-semibold">{[p.locality, p.city].filter(Boolean).join(', ') || '-'}</td>
                    <td className="px-8 py-5 text-xs text-slate-600 font-medium">{p.propertyType || '-'}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>{p.status || 'Pending'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        p.sold ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>{p.sold ? 'Sold' : 'Not Sold'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <button className="px-4 py-2 text-[10px] font-bold border border-slate-200 rounded-xl text-slate-700 hover:bg-[#141414] hover:text-white hover:border-[#141414] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN SHELL ────────────────────────────────────────────────────────────────
export function UserDashboard({ user, onClose, onLogout, onUserUpdate }: UserDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[200] flex bg-[#F8F8F8] font-sans text-[#141414] overflow-hidden">

      {/* ─── SIDEBAR ─── */}
      <motion.aside
        initial={{ x: -72, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-68 shrink-0 bg-white border-r border-slate-100 flex flex-col shadow-md hidden md:flex z-10"
      >
        {/* Brand Header */}
        <div className="px-7 pt-8 pb-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner group hover:rotate-6 transition-transform duration-300">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RAARYA" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-xs font-black tracking-[0.25em] uppercase text-[#141414]">RAARYA</p>
              <p className="text-[9px] text-slate-400 tracking-widest uppercase font-extrabold">Groups Realty</p>
            </div>
          </div>
        </div>

        {/* User Card Badge */}
        <div className="mx-4 my-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 flex items-center gap-3.5 group hover:bg-slate-100/50 hover:shadow-md hover:shadow-slate-100/80 transition-all duration-300 cursor-default">
          <div className="w-10 h-10 rounded-xl bg-[#141414] flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md group-hover:scale-105 transition-transform overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-[#141414] leading-tight truncate">{user.name || 'User'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </div>
            <span className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{user.email}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-4 flex flex-col gap-1.5">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 mb-3 ml-3">Admin Panel</p>
          {MENU.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`group/nav flex items-center justify-between px-4 py-3.5 rounded-2xl text-[13px] font-bold tracking-tight transition-all duration-300 w-full hover:-translate-y-0.5 ${
                  isActive
                    ? 'bg-[#141414] text-white shadow-xl shadow-black/15'
                    : 'text-slate-500 hover:text-[#141414] hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-300 ${isActive ? '' : 'group-hover/nav:scale-110'}`} />
                  {item.label}
                </span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-6 border-t border-slate-50">
          <button
            onClick={onLogout}
            className="group/out flex items-center gap-3.5 px-4 py-3.5 rounded-2xl w-full text-[13px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:-translate-y-0.5 transition-all duration-300"
          >
            <LogOut className="w-4.5 h-4.5 group-hover/out:translate-x-0.5 transition-transform duration-300" />
            Logout Account
          </button>
        </div>
      </motion.aside>

      {/* ─── MAIN AREA ─── */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">

        {/* Top Bar */}
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 bg-white border-b border-slate-100 px-6 lg:px-8 py-5 flex items-center justify-between gap-4 shadow-sm z-10"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#141414] font-extrabold">{activeMenu}</span>
          </div>
          <button
            onClick={onClose}
            className="group/close flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#141414] hover:bg-black text-white text-xs font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10 transition-all duration-300"
          >
            <X className="w-4 h-4 group-hover/close:rotate-90 transition-transform duration-300" />
            Back to Home
          </button>
        </motion.header>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <div className="px-6 lg:px-8 py-8">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeMenu === 'Dashboard' && <DashboardHome user={user} />}
              {activeMenu === 'Profile' && <ProfileTab user={user} onUserUpdate={onUserUpdate} />}
              {activeMenu === 'Enquiry' && <EnquiryTab user={user} />}
              {activeMenu === 'Add Property' && <AddPropertyTab user={user} />}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── LUXURY FLOATING ACTION PILLS ─── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Telephone Pill */}
        <a 
          href="tel:+911234567890" 
          className="group/phone flex items-center justify-end bg-white border border-slate-100 shadow-xl rounded-full h-12 pr-4 pl-4 hover:pl-6 transition-all duration-300 relative overflow-hidden text-slate-700 hover:text-white hover:bg-[#141414] hover:scale-105 active:scale-95 ring-4 ring-slate-100/50 cursor-pointer"
          title="Call Support"
        >
          <span className="max-w-0 overflow-hidden group-hover/phone:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap uppercase tracking-wider pr-0 group-hover/phone:pr-3">
            Call Support
          </span>
          <Phone className="w-4.5 h-4.5 shrink-0 group-hover/phone:rotate-12 transition-transform" />
        </a>

        {/* WhatsApp Pill */}
        <a 
          href="https://wa.me/911234567890" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group/wa flex items-center justify-end bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 rounded-full h-12 pr-4 pl-4 hover:pl-6 transition-all duration-300 relative overflow-hidden hover:bg-[#20ba59] hover:scale-105 active:scale-95 ring-4 ring-[#25D366]/10 cursor-pointer"
          title="WhatsApp Support"
        >
          <span className="max-w-0 overflow-hidden group-hover/wa:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap uppercase tracking-wider pr-0 group-hover/wa:pr-3">
            WhatsApp
          </span>
          <MessageCircle className="w-5 h-5 shrink-0 group-hover/wa:scale-105 transition-transform" />
        </a>
      </div>
    </div>
  );
}

