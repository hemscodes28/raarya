import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  UserCheck, 
  Coins, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Indian currency formatter
const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export function MortgagePage() {
  const [activeTab, setActiveTab] = useState<'emi' | 'eligibility'>('emi');

  // Sync tab with URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#eligibility-check') {
        setActiveTab('eligibility');
      } else {
        setActiveTab('emi');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: 'emi' | 'eligibility') => {
    setActiveTab(tab);
    window.location.hash = tab === 'emi' ? '#emi-calculator' : '#eligibility-check';
  };

  // State for EMI Calculator
  const [loanAmount, setLoanAmount] = useState<number>(1000000); // Default 10 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // Default 8.5%
  const [tenureYears, setTenureYears] = useState<number>(20); // Default 20 Years

  // State for Eligibility Calculator
  const [monthlyIncome, setMonthlyIncome] = useState<number>(75000); // Default 75k
  const [elTenureYears, setElTenureYears] = useState<number>(20); // Default 20 Years
  const [elInterestRate, setElInterestRate] = useState<number>(8.5); // Default 8.5%

  // -----------------------
  // Math for EMI Calculator
  // -----------------------
  const P = loanAmount;
  const R = interestRate;
  const N = tenureYears;

  const monthlyInterestRate = R / 12 / 100;
  const totalMonths = N * 12;

  let emi = 0;
  if (monthlyInterestRate === 0) {
    emi = P / totalMonths;
  } else {
    emi = (P * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
          (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
  }

  const totalPayment = emi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - P);

  // SVG circular chart calculations (Circumference = 2 * pi * r = 2 * 3.14 * 60 = 377)
  const radius = 60;
  const circ = 2 * Math.PI * radius;
  const interestRatio = totalPayment > 0 ? totalInterest / totalPayment : 0;
  const interestStrokeOffset = circ * (1 - interestRatio);

  // -----------------------
  // Math for Eligibility Check
  // -----------------------
  const FOIR = 0.40; // Banks typically allow up to 40% of salary as EMI, matching the old website's calculations
  const availableEmi = monthlyIncome * FOIR;

  const elMonthlyInterest = elInterestRate / 12 / 100;
  const elTotalMonths = elTenureYears * 12;

  let eligibleLoan = 0;
  if (availableEmi > 0) {
    if (elMonthlyInterest === 0) {
      eligibleLoan = availableEmi * elTotalMonths;
    } else {
      eligibleLoan = (availableEmi * (Math.pow(1 + elMonthlyInterest, elTotalMonths) - 1)) / 
                     (elMonthlyInterest * Math.pow(1 + elMonthlyInterest, elTotalMonths));
    }
  }

  const elTotalPayment = availableEmi * elTotalMonths;
  const elTotalInterest = Math.max(0, elTotalPayment - eligibleLoan);

  const elInterestRatio = elTotalPayment > 0 ? elTotalInterest / elTotalPayment : 0;
  const elInterestStrokeOffset = circ * (1 - elInterestRatio);

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full bg-transparent text-[#141414] overflow-hidden pt-4 sm:pt-6 pb-16 md:py-20 px-4 sm:px-6 lg:px-8">

      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Title area */}
        <div className="text-center space-y-4">
          <span className="text-amber-600 text-xs font-bold tracking-[0.25em] uppercase block">
            Home Loan Services
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#141414]">
            Loan Assist & Calculator
          </h1>
          <p className="text-sm text-zinc-700 max-w-xl mx-auto font-lora italic tracking-wide">
            Plan your property acquisitions intelligently with our synchronized, real-time calculators.
          </p>

          {/* Tab Pill Selector */}
          <div className="relative bg-white/80 border border-black/5 p-1 rounded-full flex gap-1 w-fit mx-auto shadow-sm backdrop-blur-md mt-6">
            <button
              onClick={() => handleTabChange('emi')}
              className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                activeTab === 'emi' ? 'text-white z-10' : 'text-black/60 hover:text-black'
              }`}
            >
              {activeTab === 'emi' && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#141414] rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <span className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5" />
                EMI Calculator
              </span>
            </button>

            <button
              onClick={() => handleTabChange('eligibility')}
              className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                activeTab === 'eligibility' ? 'text-white z-10' : 'text-black/60 hover:text-black'
              }`}
            >
              {activeTab === 'eligibility' && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#141414] rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <span className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5" />
                Eligibility Check
              </span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'emi' ? (
            <motion.div
              key="emi-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Column: Interactive Controls */}
              <div className="lg:col-span-7 bg-white/70 border border-black/[0.03] backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm flex flex-col gap-8">
                <h3 className="text-lg font-bold tracking-wide text-black/90 pb-4 border-b border-black/5 flex items-center gap-3">
                  <Coins className="w-5 h-5 text-amber-600 animate-pulse" />
                  Loan Variables
                </h3>

                {/* Slider 1: Loan Amount */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-1.5">
                      Loan Amount
                    </label>
                    <div className="flex items-center bg-white border border-black/[0.08] focus-within:border-amber-500 rounded-xl px-3 py-1.5 shadow-sm transition-all">
                      <span className="text-sm font-semibold text-black/40 mr-1">₹</span>
                      <input 
                        type="number" 
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-28 text-sm font-bold text-black outline-none bg-transparent"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="100000000"
                    step="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-black/[0.06] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-black/30 tracking-wider">
                    <span>{formatINR(100000)}</span>
                    <span className="text-amber-600/70">{formatINR(loanAmount)}</span>
                    <span>{formatINR(100000000)}</span>
                  </div>
                </div>

                {/* Slider 2: Interest Rate */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-black/40 uppercase tracking-widest">
                      Rate of Interest (p.a)
                    </label>
                    <div className="flex items-center bg-white border border-black/[0.08] focus-within:border-amber-500 rounded-xl px-3 py-1.5 shadow-sm transition-all">
                      <input 
                        type="number" 
                        step="0.05"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-14 text-sm font-bold text-black outline-none bg-transparent text-right pr-0.5"
                      />
                      <span className="text-sm font-semibold text-black/40">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="0.05"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-black/[0.06] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-black/30 tracking-wider">
                    <span>5 %</span>
                    <span className="text-amber-600/70">{interestRate}%</span>
                    <span>20 %</span>
                  </div>
                </div>

                {/* Slider 3: Tenure Years */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-black/40 uppercase tracking-widest">
                      Loan Tenure
                    </label>
                    <div className="flex items-center bg-white border border-black/[0.08] focus-within:border-amber-500 rounded-xl px-3 py-1.5 shadow-sm transition-all">
                      <input 
                        type="number" 
                        value={tenureYears}
                        onChange={(e) => setTenureYears(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                        className="w-10 text-sm font-bold text-black outline-none bg-transparent text-right pr-0.5"
                      />
                      <span className="text-sm font-semibold text-black/40">Yrs</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-black/[0.06] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-black/30 tracking-wider">
                    <span>1 Year</span>
                    <span className="text-amber-600/70">{tenureYears} Years</span>
                    <span>30 Years</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Summary */}
              <div className="lg:col-span-5 bg-white/75 border border-black/[0.04] backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col justify-between items-center text-center relative overflow-hidden">
                <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-amber-500/5 blur-[65px] pointer-events-none" />

                <div className="w-full">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-black/40">
                    Monthly Installment
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-600 mt-2 select-none tracking-tight">
                    {formatINR(emi)}
                  </div>
                </div>

                {/* SVG Responsive Doughnut Chart in Center */}
                <div className="my-8 relative flex items-center justify-center">
                  <svg className="w-48 h-48 rotate-[-90deg]">
                    {/* Background Circle (Principal amount share) */}
                    <circle
                      cx="96"
                      cy="96"
                      r={radius}
                      stroke="rgba(20, 20, 20, 0.05)"
                      strokeWidth="16"
                      fill="transparent"
                    />
                    {/* Foreground Circle (Interest portion share) */}
                    <motion.circle
                      cx="96"
                      cy="96"
                      r={radius}
                      stroke="#B89047"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: interestStrokeOffset }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10px] font-extrabold text-black/40 uppercase tracking-widest">Tenure</span>
                    <span className="text-xl font-extrabold text-[#141414] mt-0.5">{tenureYears} Years</span>
                  </div>
                </div>

                {/* Output Metrics breakdown - Large & Clearly Visible vertical list with custom drawing-border boxes */}
                <div className="w-full space-y-3.5 border-t border-black/5 pt-6 mt-2 text-left">
                  {/* Card 1: Principal */}
                  <div className="relative p-3 sm:p-4 rounded-2xl border border-black/5 bg-white/40 transition-all duration-300 group hover:shadow-[0_10px_20px_rgba(184,144,71,0.04)] hover:bg-amber-500/[0.01] flex justify-between items-center overflow-hidden select-none">
                    {/* Top border lines starting from center */}
                    <span className="absolute top-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute top-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Bottom border lines starting from center */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute bottom-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Left border lines starting from center sides */}
                    <span className="absolute left-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute left-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />
                    {/* Right border lines starting from center sides */}
                    <span className="absolute right-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute right-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#141414]/40 relative z-[2]">Principal Loan Amount</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#141414] relative z-[2] transition-colors group-hover:text-amber-600">
                      {formatINR(loanAmount)}
                    </span>
                  </div>

                  {/* Card 2: Interest */}
                  <div className="relative p-3 sm:p-4 rounded-2xl border border-black/5 bg-white/40 transition-all duration-300 group hover:shadow-[0_10px_20px_rgba(184,144,71,0.04)] hover:bg-amber-500/[0.01] flex justify-between items-center overflow-hidden select-none">
                    {/* Top border lines starting from center */}
                    <span className="absolute top-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute top-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Bottom border lines starting from center */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute bottom-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Left border lines starting from center sides */}
                    <span className="absolute left-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute left-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />
                    {/* Right border lines starting from center sides */}
                    <span className="absolute right-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute right-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#141414]/40 relative z-[2]">Total Interest Payable</span>
                    <span className="text-sm sm:text-base font-extrabold text-amber-600 relative z-[2]">
                      {formatINR(totalInterest)}
                    </span>
                  </div>

                  {/* Card 3: Total Repay */}
                  <div className="relative p-3 sm:p-4 rounded-2xl border border-black/5 bg-white/40 transition-all duration-300 group hover:shadow-[0_10px_20px_rgba(184,144,71,0.04)] hover:bg-amber-500/[0.01] flex justify-between items-center overflow-hidden select-none">
                    {/* Top border lines starting from center */}
                    <span className="absolute top-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute top-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Bottom border lines starting from center */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute bottom-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Left border lines starting from center sides */}
                    <span className="absolute left-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute left-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />
                    {/* Right border lines starting from center sides */}
                    <span className="absolute right-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute right-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#141414]/50 relative z-[2]">Total Amount Payable</span>
                    <span className="text-sm sm:text-base font-black text-[#141414] relative z-[2] transition-colors group-hover:text-amber-700">
                      {formatINR(totalPayment)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="eligibility-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Column: Eligibility Inputs & Breakdown */}
              <div className="lg:col-span-7 bg-white/70 border border-black/[0.03] backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm flex flex-col gap-8">
                <h3 className="text-lg font-bold tracking-wide text-black/90 pb-4 border-b border-black/5 flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-amber-600 animate-pulse" />
                  Eligibility Inputs
                </h3>

                {/* Input 1: Gross Monthly Income */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-black/40 uppercase tracking-widest">
                      Gross Monthly Income
                    </label>
                    <div className="flex items-center bg-white border border-black/[0.08] focus-within:border-amber-500 rounded-xl px-3 py-1.5 shadow-sm transition-all">
                      <span className="text-sm font-semibold text-black/40 mr-1">₹</span>
                      <input 
                        type="number" 
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-24 text-sm font-bold text-black outline-none bg-transparent"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="10000000"
                    step="5000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-black/[0.06] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-black/30 tracking-wider">
                    <span>5,000</span>
                    <span className="text-amber-600/70">{formatINR(monthlyIncome)}</span>
                    <span>1 Crore</span>
                  </div>
                </div>

                {/* Existing monthly EMIs input removed per user request to match the old website inputs */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input 3: Tenure Years */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest">
                        Tenure (Years)
                      </label>
                      <div className="flex items-center bg-white border border-black/[0.08] focus-within:border-amber-500 rounded-xl px-3 py-1.5 shadow-sm transition-all">
                        <input 
                          type="number" 
                          value={elTenureYears}
                          onChange={(e) => setElTenureYears(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                          className="w-10 text-sm font-bold text-black outline-none bg-transparent text-right"
                        />
                        <span className="text-xs font-medium text-black/40 ml-1">Yrs</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={elTenureYears}
                      onChange={(e) => setElTenureYears(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-black/[0.06] rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Input 4: Interest Rate */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-widest">
                        Interest Rate
                      </label>
                      <div className="flex items-center bg-white border border-black/[0.08] focus-within:border-amber-500 rounded-xl px-3 py-1.5 shadow-sm transition-all">
                        <input 
                          type="number" 
                          step="0.1"
                          value={elInterestRate}
                          onChange={(e) => setElInterestRate(Math.max(0.1, parseFloat(e.target.value) || 8.5))}
                          className="w-12 text-sm font-bold text-black outline-none bg-transparent text-right"
                        />
                        <span className="text-xs font-medium text-black/40 ml-1">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="0.1"
                      value={elInterestRate}
                      onChange={(e) => setElInterestRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-black/[0.06] rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>

                {/* Detailed Breakdown Table */}
                <div className="mt-6 border-t border-black/5 pt-6">
                  <h4 className="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">
                    Eligibility Breakdown Table
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-black/10 text-black/40 font-bold uppercase tracking-wider">
                          <th className="py-2 pr-4 font-bold text-[10px]">Financial Variable</th>
                          <th className="py-2 text-right font-bold text-[10px]">Calculated Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-black/80">
                        <tr>
                          <td className="py-2.5 font-semibold text-black/70">Gross Monthly Income</td>
                          <td className="py-2.5 text-right font-bold text-[#141414]">{formatINR(monthlyIncome)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-black/70">Max Allowable EMI (40% FOIR)</td>
                          <td className="py-2.5 text-right font-bold text-amber-600">{formatINR(availableEmi)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-black/70">Interest Rate (p.a)</td>
                          <td className="py-2.5 text-right font-bold text-[#141414]">{elInterestRate}%</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-black/70">Loan Tenure</td>
                          <td className="py-2.5 text-right font-bold text-[#141414]">{elTenureYears} Yrs ({elTotalMonths} Months)</td>
                        </tr>
                        <tr className="border-t border-black/10 font-bold text-amber-800">
                          <td className="py-2.5 font-bold">Total Interest Payable</td>
                          <td className="py-2.5 text-right font-black">{formatINR(elTotalInterest)}</td>
                        </tr>
                        <tr className="border-b border-black/10 font-black text-black">
                          <td className="py-2.5 text-sm font-extrabold uppercase">Total Repayment Amount</td>
                          <td className="py-2.5 text-right text-sm font-black">{formatINR(elTotalPayment)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Eligibility Outputs */}
              <div className="lg:col-span-5 bg-white/75 border border-black/[0.04] backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-amber-500/5 blur-[65px] pointer-events-none" />

                {/* Score badge / status */}
                <div className="w-full flex items-center justify-between border-b border-black/5 pb-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#141414]/40">Status</span>
                  {availableEmi > 0 ? (
                    <span className="px-3.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Eligible for Loan
                    </span>
                  ) : (
                    <span className="px-3.5 py-1 text-[11px] font-bold rounded-full bg-red-50 text-red-700 border border-red-100 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      Income Cap Reached
                    </span>
                  )}
                </div>

                {/* Primary Output Display */}
                <div className="my-6 text-center space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-black/40">
                    Maximum Borrowing Capacity
                  </span>
                  <div className="text-4xl font-black text-amber-600 tracking-tight py-2 select-none">
                    {eligibleLoan > 0 ? formatINR(eligibleLoan) : '₹ 0'}
                  </div>
                  <p className="text-xs font-light text-black/40">
                    Estimate based on 40% Debt-to-Income FOIR ratio
                  </p>
                </div>

                {/* SVG Responsive Doughnut Chart in Center */}
                <div className="my-6 relative flex items-center justify-center">
                  <svg className="w-48 h-48 rotate-[-90deg]">
                    {/* Background Circle (Principal amount share) */}
                    <circle
                      cx="96"
                      cy="96"
                      r={radius}
                      stroke="rgba(20, 20, 20, 0.05)"
                      strokeWidth="16"
                      fill="transparent"
                    />
                    {/* Foreground Circle (Interest portion share) */}
                    <motion.circle
                      cx="96"
                      cy="96"
                      r={radius}
                      stroke="#B89047"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: elInterestStrokeOffset }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10px] font-extrabold text-black/40 uppercase tracking-widest">Tenure</span>
                    <span className="text-xl font-extrabold text-[#141414] mt-0.5">{elTenureYears} Years</span>
                  </div>
                </div>

                {/* Output Metrics breakdown - Large & Clearly Visible vertical list with custom drawing-border boxes */}
                <div className="w-full space-y-3.5 border-t border-black/5 pt-6 mt-2 text-left">
                  {/* Card 1: Principal */}
                  <div className="relative p-3 sm:p-4 rounded-2xl border border-black/5 bg-white/40 transition-all duration-300 group hover:shadow-[0_10px_20px_rgba(184,144,71,0.04)] hover:bg-amber-500/[0.01] flex justify-between items-center overflow-hidden select-none">
                    {/* Top border lines starting from center */}
                    <span className="absolute top-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute top-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Bottom border lines starting from center */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute bottom-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Left border lines starting from center sides */}
                    <span className="absolute left-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute left-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />
                    {/* Right border lines starting from center sides */}
                    <span className="absolute right-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute right-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#141414]/40 relative z-[2]">Principal Loan Amount</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#141414] relative z-[2] transition-colors group-hover:text-amber-600">
                      {formatINR(eligibleLoan)}
                    </span>
                  </div>

                  {/* Card 2: Interest */}
                  <div className="relative p-3 sm:p-4 rounded-2xl border border-black/5 bg-white/40 transition-all duration-300 group hover:shadow-[0_10px_20px_rgba(184,144,71,0.04)] hover:bg-amber-500/[0.01] flex justify-between items-center overflow-hidden select-none">
                    {/* Top border lines starting from center */}
                    <span className="absolute top-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute top-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Bottom border lines starting from center */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute bottom-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Left border lines starting from center sides */}
                    <span className="absolute left-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute left-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />
                    {/* Right border lines starting from center sides */}
                    <span className="absolute right-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute right-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#141414]/40 relative z-[2]">Total Interest Payable</span>
                    <span className="text-sm sm:text-base font-extrabold text-amber-600 relative z-[2]">
                      {formatINR(elTotalInterest)}
                    </span>
                  </div>

                  {/* Card 3: Total Repay */}
                  <div className="relative p-3 sm:p-4 rounded-2xl border border-black/5 bg-white/40 transition-all duration-300 group hover:shadow-[0_10px_20px_rgba(184,144,71,0.04)] hover:bg-amber-500/[0.01] flex justify-between items-center overflow-hidden select-none">
                    {/* Top border lines starting from center */}
                    <span className="absolute top-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute top-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Bottom border lines starting from center */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:left-0" />
                    <span className="absolute bottom-0 right-1/2 w-0 h-[1.5px] bg-amber-500 transition-all duration-300 group-hover:w-1/2 group-hover:right-0" />
                    {/* Left border lines starting from center sides */}
                    <span className="absolute left-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute left-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />
                    {/* Right border lines starting from center sides */}
                    <span className="absolute right-0 top-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:top-0" />
                    <span className="absolute right-0 bottom-1/2 h-0 w-[1.5px] bg-amber-500 transition-all duration-300 group-hover:h-1/2 group-hover:bottom-0" />

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#141414]/50 relative z-[2]">Total Amount Payable</span>
                    <span className="text-sm sm:text-base font-black text-[#141414] relative z-[2] transition-colors group-hover:text-amber-700">
                      {formatINR(elTotalPayment)}
                    </span>
                  </div>
                </div>

                {/* Advisory Tip Box */}
                {monthlyIncome > 0 ? (
                  <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 flex gap-3 items-start mt-6 text-left">
                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800/80 leading-relaxed font-light">
                      <strong>Advisor tip:</strong> Adding a co-applicant with an independent income source will immediately boost your maximum loan eligibility.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 flex gap-3 items-start mt-6 text-left">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-xs text-amber-800/80 leading-relaxed font-light">
                      Please adjust the Gross Monthly Income slider to calculate your maximum home loan eligibility.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
