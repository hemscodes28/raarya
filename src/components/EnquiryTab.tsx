import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MessageSquare, RefreshCw, User, Phone, Tag, HelpCircle, Calendar, FileText } from 'lucide-react';
import { apiGetEnquiries } from '../utils/api';

interface EnquiryTabProps {
  user: { email: string };
}

export function EnquiryTab({ user }: EnquiryTabProps) {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await apiGetEnquiries(user.email);
      if (data.success) setEnquiries(data.enquiries || []);
    } catch { /* server may not be reachable */ }
    setLoading(false);
  };

  useEffect(() => { fetchEnquiries(); }, [user.email]);

  const filtered = enquiries.filter(e =>
    (e.propertyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.reason || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cols = [
    { label: 'Property Name', icon: Tag },
    { label: 'Name & Mobile', icon: User },
    { label: 'Reason For Buying', icon: MessageSquare },
    { label: 'Who Are You', icon: HelpCircle },
    { label: 'Planning to Buy', icon: Calendar },
    { label: 'Message', icon: FileText },
    { label: 'Action', icon: Phone },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl bg-gradient-to-br from-[#141414] to-[#2a2a2a] p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-white/[0.08]"
      >
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 mb-1">Inbox Feed</p>
          <h2 className="text-xl md:text-2xl font-medium text-white tracking-tight" style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}>
            Property Enquiries
          </h2>
          <p className="text-xs text-white/40 mt-1">Messages from interested buyers and renters</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/70 text-xs font-semibold">
            {filtered.length} Enquiry Found
          </div>
          <button
            onClick={fetchEnquiries}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#141414] text-xs font-bold hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        {/* Toolbar */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search like: property name (or) reason…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#141414] placeholder:text-slate-400 outline-none focus:border-[#141414] focus:bg-white focus:ring-4 focus:ring-[#141414]/5 transition-all duration-300"
            />
          </div>
          <p className="text-xs text-slate-400 font-extrabold tracking-tight shrink-0">{filtered.length} Results found</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {cols.map(col => {
                  const Icon = col.icon;
                  return (
                    <th key={col.label} className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                        <Icon className="w-3.5 h-3.5" /> {col.label}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-slate-200 border-t-[#141414] rounded-full animate-spin" />
                      <p className="text-xs text-slate-400 font-semibold">Loading enquiries…</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500">No enquiries found</p>
                        <p className="text-xs text-slate-400 mt-1">When buyers enquire about your properties, they'll appear here.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((e, i) => (
                  <tr key={i} className="group/row hover:bg-slate-50/40 transition-colors duration-200">
                    <td className="px-6 py-5 text-xs font-bold text-[#141414] whitespace-nowrap">{e.propertyName || '-'}</td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-xs font-bold text-[#141414]">{e.buyerName || '-'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{e.mobile || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-600 font-semibold">{e.reason || '-'}</td>
                    <td className="px-6 py-5 text-xs text-slate-600 font-medium">{e.whoAreYou || '-'}</td>
                    <td className="px-6 py-5 text-xs text-slate-600 font-medium">{e.planningToBuy || '-'}</td>
                    <td className="px-6 py-5 text-xs text-slate-600 max-w-[180px] truncate font-medium" title={e.message}>{e.message || '-'}</td>
                    <td className="px-6 py-5">
                      <button className="px-4 py-2 text-[10px] font-bold border border-slate-200 rounded-xl text-slate-700 hover:bg-[#141414] hover:text-white hover:border-[#141414] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm">
                        Contact
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
