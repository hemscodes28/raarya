import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Check, Building2, MapPin, Image, IndianRupee, ArrowRight, AlertCircle } from 'lucide-react';

interface AddPropertyTabProps {
  user: { email: string; name: string; phone?: string };
}

const STEPS = [
  { id: 1, label: 'Basic Details', desc: 'About you & listing type', icon: Building2 },
  { id: 2, label: 'Location Details', desc: 'Where is the property?', icon: MapPin },
  { id: 3, label: 'Property Profile', desc: 'Dimensions & specifications', icon: Building2 },
  { id: 4, label: 'Photos & Details', desc: 'Title, description, images', icon: Image },
  { id: 5, label: 'Pricing & Others', desc: 'Set price & contact', icon: IndianRupee },
];

const pill = (label: string, active: boolean, onClick: () => void) => (
  <button
    key={label}
    type="button"
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 ${
      active
        ? 'bg-[#141414] text-white border-[#141414] shadow-md shadow-black/10'
        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-[#141414] hover:scale-[1.02]'
    }`}
  >
    {label}
  </button>
);

const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#141414] placeholder:text-slate-400 outline-none focus:border-[#141414] focus:ring-2 focus:ring-[#141414]/8 transition-all duration-300 bg-white hover:border-slate-300';
const labelCls = 'text-[11px] font-bold text-slate-500 uppercase tracking-widest';

export function AddPropertyTab({ user }: AddPropertyTabProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [youAre, setYouAre] = useState('Owner');
  const [propertyFor, setPropertyFor] = useState('Sell');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [propertyType, setPropertyType] = useState('Plot');
  const [areaUnit, setAreaUnit] = useState('Sq.Ft');
  const [area, setArea] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('Total Price');
  const [contactMobile, setContactMobile] = useState(user.phone || '');
  const [contactEmail, setContactEmail] = useState(user.email || '');

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const validateStep = () => {
    setStepError('');
    if (step === 1) {
      if (!youAre || !propertyFor) {
        setStepError('Please select both your profile type and property listing intent.');
        return false;
      }
    } else if (step === 2) {
      if (!state || !district || !city) {
        setStepError('Please select State, District, and City to locate the property.');
        return false;
      }
    } else if (step === 3) {
      if (!propertyType || !area || parseFloat(area) <= 0) {
        setStepError('Please select property type and input a valid positive area size.');
        return false;
      }
    } else if (step === 4) {
      if (!title.trim() || title.trim().length < 5) {
        setStepError('Please enter a descriptive property title of at least 5 characters.');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (validateStep()) {
      if (step < 5) setStep(s => s + 1);
    }
  };

  const prev = () => {
    setStepError('');
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!price || parseFloat(price) <= 0) { setError('Please enter a valid property price.'); return; }
    if (!contactMobile || contactMobile.trim().length < 10) { setError('Please enter a valid 10-digit mobile number.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email, userName: user.name,
          youAre, propertyFor, state, district, city, locality, mapLink,
          propertyType, areaUnit, area, title, description, price, priceType,
          contactMobile, contactEmail,
        }),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setError(data.message || 'Failed to submit property.');
    } catch {
      setError('Unable to connect to server. Please ensure the backend is running.');
    }
    setLoading(false);
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep < step) {
      setStep(targetStep);
      setStepError('');
    } else {
      // Validate up to the target step
      let tempStep = step;
      let valid = true;
      while (tempStep < targetStep) {
        if (tempStep === 1 && (!youAre || !propertyFor)) valid = false;
        if (tempStep === 2 && (!state || !district || !city)) valid = false;
        if (tempStep === 3 && (!propertyType || !area || parseFloat(area) <= 0)) valid = false;
        if (tempStep === 4 && (!title.trim() || title.trim().length < 5)) valid = false;
        if (!valid) break;
        tempStep++;
      }
      if (valid) {
        setStep(targetStep);
        setStepError('');
      } else {
        setStepError('Please complete all required fields on the current step first.');
      }
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center py-24 gap-6 max-w-md mx-auto text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-100">
          <Check className="w-9 h-9" />
        </div>
        <div>
          <h3 className="text-2xl font-medium text-[#141414] tracking-tight" style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}>Property Listed!</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">Your property "<strong>{title}</strong>" has been submitted for review and will be live shortly.</p>
        </div>
        <button
          onClick={() => { setSubmitted(false); setStep(1); setTitle(''); setPrice(''); setArea(''); setLocality(''); }}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white text-xs font-bold rounded-xl hover:bg-black hover:scale-[1.02] transition-all duration-300"
        >
          Add Another Property <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto w-full">

      {/* Left: Step Sidebar */}
      <div className="lg:w-64 shrink-0">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm sticky top-6"
        >
          {/* Brand */}
          <div className="flex items-center gap-2 mb-6 pb-5 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#141414]" />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#141414]">Raarya Properties</span>
          </div>

          {/* Steps list */}
          <div className="flex flex-col gap-1">
            {STEPS.map(s => {
              const isDone = s.id < step;
              const isActive = s.id === step;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStepClick(s.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left w-full ${
                    isActive ? 'bg-[#141414] text-white' :
                    isDone ? 'hover:bg-emerald-50 cursor-pointer' : 'cursor-pointer hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border transition-all duration-300 ${
                    isActive ? 'bg-white text-[#141414] border-transparent' :
                    isDone ? 'bg-emerald-500 text-white border-emerald-500' :
                    'bg-transparent text-slate-400 border-slate-200'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : isDone ? 'text-emerald-700' : 'text-slate-500'}`}>{s.label}</span>
                    <span className={`text-[9px] ${isActive ? 'text-white/60' : 'text-slate-400'}`}>Step {s.id}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress Ring */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-1">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#141414" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                  strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#141414]">{Math.round(progress)}%</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Completion</p>
          </div>
        </motion.div>
      </div>

      {/* Right: Step Content */}
      <div className="flex-grow min-w-0">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm"
        >
          {/* Top progress bar */}
          <div className="h-1 bg-slate-100">
            <div className="h-full bg-[#141414] transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>

          <div className="p-8">
            {/* Step Header */}
            <div className="flex items-center gap-4 mb-7 pb-7 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-[#141414] text-white flex items-center justify-center text-lg font-bold shadow-md shadow-black/10">{step}</div>
              <div>
                <h3 className="text-xl font-medium text-[#141414] tracking-tight" style={{ fontFamily: "'PP Editorial New', 'Playfair Display', Georgia, serif" }}>{STEPS[step - 1].label}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{STEPS[step - 1].desc}</p>
              </div>
            </div>

            <p className="text-xs text-rose-400 font-semibold mb-6">Fields marked <span className="text-rose-500">*</span> are required</p>

            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <label className={labelCls}>You Are <span className="text-rose-400">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {['Owner', 'Agent', 'Builder'].map(v => pill(v, youAre === v, () => { setYouAre(v); setStepError(''); }))}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className={labelCls}>Your Property Is For <span className="text-rose-400">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {['Sell', 'Rent', 'PG / Hostel'].map(v => pill(v, propertyFor === v, () => { setPropertyFor(v); setStepError(''); }))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  We auto-detected your location as Chennai. You can change it below.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>State <span className="text-rose-400">*</span></label>
                    <select className={inputCls} value={state} onChange={e => { setState(e.target.value); setStepError(''); }}>
                      <option value="">Select State</option>
                      <option>Tamil Nadu</option><option>Karnataka</option><option>Andhra Pradesh</option>
                      <option>Telangana</option><option>Kerala</option><option>Maharashtra</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>District <span className="text-rose-400">*</span></label>
                    <select className={inputCls} value={district} onChange={e => { setDistrict(e.target.value); setStepError(''); }}>
                      <option value="">Select District</option>
                      <option>Coimbatore</option><option>Chennai</option><option>Madurai</option>
                      <option>Salem</option><option>Tiruchirappalli</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>City <span className="text-rose-400">*</span></label>
                    <select className={inputCls} value={city} onChange={e => { setCity(e.target.value); setStepError(''); }}>
                      <option value="">Select City</option>
                      <option>Coimbatore</option><option>Chennai</option><option>Saravanampatti</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Locality / Area</label>
                    <input className={inputCls} value={locality} onChange={e => setLocality(e.target.value)} placeholder="e.g. Saibaba Colony, Peelamedu" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Google Map Link <span className="text-slate-400 normal-case font-medium">(optional)</span></label>
                  <input className={inputCls} value={mapLink} onChange={e => setMapLink(e.target.value)} placeholder="Paste Google Maps share link" />
                </div>
              </div>
            )}

            {/* ─── STEP 3 ─── */}
            {step === 3 && (
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-3">
                  <label className={labelCls}>Property Type <span className="text-rose-400">*</span></label>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">1. Residential</p>
                      <div className="flex flex-wrap gap-2">
                        {['Flat', 'Villa', 'Plot', 'House', 'Builder Floor', 'Studio Apartment', 'Farm House', 'Land'].map(v =>
                          pill(v, propertyType === v, () => { setPropertyType(v); setStepError(''); })
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">2. Commercial</p>
                      <div className="flex flex-wrap gap-2">
                        {['Office Space', 'Shop', 'Showroom', 'Warehouse'].map(v =>
                          pill(v, propertyType === v, () => { setPropertyType(v); setStepError(''); })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className={labelCls}>Area <span className="text-rose-400">*</span></label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Sq.Ft', 'Sq.m', 'Cent', 'Acre', 'BHK'].map(v => pill(v, areaUnit === v, () => setAreaUnit(v)))}
                  </div>
                  <input className={inputCls} value={area} onChange={e => { setArea(e.target.value); setStepError(''); }} placeholder={`Enter area in ${areaUnit}`} type="number" />
                </div>
              </div>
            )}

            {/* ─── STEP 4 ─── */}
            {step === 4 && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Property Title <span className="text-rose-400">*</span></label>
                  <input className={inputCls} value={title} onChange={e => { setTitle(e.target.value); setStepError(''); }} placeholder="e.g. Spacious 3BHK Villa in Saravanampatti" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={`${inputCls} min-h-[120px] resize-y`}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the property — highlights, nearby landmarks, unique features…"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Cover / Featured Image</label>
                  <label className="flex items-center gap-3 px-4 py-3 border border-slate-200 border-dashed rounded-xl cursor-pointer hover:border-[#141414] hover:bg-slate-50 transition-all duration-300 group/upload">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover/upload:bg-[#141414] group-hover/upload:text-white transition-all duration-300">
                      <Image className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 group-hover/upload:text-[#141414] transition-colors">Choose file</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG up to 10MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* ─── STEP 5 ─── */}
            {step === 5 && (
              <div className="flex flex-col gap-5">
                <p className="text-xs text-slate-500 -mt-2">Fields marked <span className="text-rose-500 font-semibold">*</span> are required. Mobile OTP verification is mandatory before submitting.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Price (₹) <span className="text-rose-400">*</span></label>
                    <input className={inputCls} value={price} onChange={e => { setPrice(e.target.value); setError(''); }} placeholder="Enter expected price" type="number" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Price Type</label>
                    <select className={inputCls} value={priceType} onChange={e => setPriceType(e.target.value)}>
                      <option>Total Price</option><option>Per Sq.Ft</option><option>Per Cent</option><option>Per Acre</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Contact Mobile Number <span className="text-rose-400">*</span></label>
                  <div className="flex gap-3">
                    <input className={`${inputCls} flex-grow`} value={contactMobile} onChange={e => { setContactMobile(e.target.value); setError(''); }} placeholder="Enter 10-digit mobile number" type="tel" />
                    <button type="button" className="flex items-center gap-2 px-4 py-3 bg-[#141414] text-white text-xs font-bold rounded-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 whitespace-nowrap shadow-md shadow-black/10">
                      Send OTP
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Email Address</label>
                  <input className={inputCls} value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="your@email.com" type="email" />
                </div>
                {error && <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{error}</p>}
              </div>
            )}

            {/* Step-specific inline error display */}
            {stepError && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{stepError}</span>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-7 border-t border-slate-100">
              <button
                onClick={prev}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 ${step === 1 ? 'invisible' : ''}`}
              >
                ← Back
              </button>
              {step < 5 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-7 py-3 bg-[#141414] text-white text-xs font-bold rounded-xl shadow-md shadow-black/10 hover:bg-black hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Submit Listing
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
