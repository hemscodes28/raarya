import { useState } from 'react';

export function LoanCalculatorSection() {
  const [amount, setAmount] = useState(5000000); // 50 Lakhs default
  const [interest, setInterest] = useState(8.5); // 8.5% default
  const [tenure, setTenure] = useState(20); // 20 years default

  // Calculate EMI
  const P = amount;
  const r = interest / 12 / 100;
  const n = tenure * 12;
  
  const emi = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
  const totalAmount = emi * n;
  const totalInterest = totalAmount - P;

  // Format currency in Lakhs/Crores (Indian System)
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="relative bg-white px-5 py-20 md:px-10 md:py-28 border-t border-black/5">
      {/* Scroll target offset */}
      <div id="home-loan" className="absolute -top-24" />
      
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-medium leading-[1.1] tracking-tight text-[#141414] md:text-5xl" data-editable>
              Home Loan Calculator
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#A5A5A5]" data-editable>
              Planning to build your dream home or buy a plot? Calculate your monthly EMI options with our interactive calculator instantly.
            </p>
            <div className="mt-8 space-y-6 bg-[#F8F8F8] p-6 border border-black/5">
              <div>
                <span className="text-[12px] text-[#A5A5A5] uppercase tracking-wider block font-semibold">Monthly EMI</span>
                <span className="text-3xl font-bold text-[#141414] mt-1 block">{formatINR(emi)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-4">
                <div>
                  <span className="text-[11px] text-[#A5A5A5] uppercase tracking-wider block">Principal Amount</span>
                  <span className="text-[16px] font-semibold text-[#141414]">{formatINR(amount)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A5A5A5] uppercase tracking-wider block">Total Interest</span>
                  <span className="text-[16px] font-semibold text-[#141414]">{formatINR(totalInterest)}</span>
                </div>
              </div>
              <div className="border-t border-black/10 pt-4">
                <span className="text-[11px] text-[#A5A5A5] uppercase tracking-wider block">Total Payable</span>
                <span className="text-[18px] font-semibold text-[#141414]">{formatINR(totalAmount)}</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between text-[13px] font-semibold text-[#141414]">
                <span>Loan Amount</span>
                <span>{formatINR(amount)}</span>
              </div>
              <input
                type="range"
                min="500000"
                max="20000000"
                step="100000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-1 bg-black/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-[#A5A5A5]">
                <span>₹5 Lakhs</span>
                <span>₹2 Crores</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[13px] font-semibold text-[#141414]">
                <span>Interest Rate</span>
                <span>{interest}% p.a.</span>
              </div>
              <input
                type="range"
                min="7"
                max="15"
                step="0.1"
                value={interest}
                onChange={(e) => setInterest(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-1 bg-black/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-[#A5A5A5]">
                <span>7%</span>
                <span>15%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[13px] font-semibold text-[#141414]">
                <span>Tenure (Years)</span>
                <span>{tenure} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-1 bg-black/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-[#A5A5A5]">
                <span>5 Yrs</span>
                <span>30 Yrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
