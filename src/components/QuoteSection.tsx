import { useState } from "react";

import { Search, Home, ChevronDown } from "lucide-react";

export function QuoteSection() {
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "pg-hostel">("buy");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Coimbatore");
  const [city, setCity] = useState("Select City");
  const [propertyType, setPropertyType] = useState("Select Property Type");
  const [budget, setBudget] = useState("Select Budget");

  const handleSearch = () => {
    // Dynamically update the active tab in PropertiesSection by changing the window hash
    window.location.hash = activeTab;
    
    // Smooth scroll to the target property section
    const targetElement = document.getElementById(activeTab);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePostProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = "contact";
    const targetElement = document.getElementById("contact");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative bg-[#F8F8F8] px-4 py-8 md:px-10 flex flex-col items-center">
      {/* 1. Will Rogers Quote (Simple, single line, no box, clean & elegant) */}
      <div className="text-center max-w-4xl mx-auto mb-10 px-4 select-none">
        <p className="text-lg md:text-2xl font-serif italic text-[#141414]/90 tracking-tight leading-relaxed">
          "Don't wait to buy land. Buy land and wait."
          <span className="text-xs md:text-sm font-sans font-bold uppercase tracking-[0.2em] text-[#141414]/40 ml-3.5 whitespace-nowrap">
            — Will Rogers
          </span>
        </p>
      </div>

      {/* 2. Premium Real Estate Search Widget */}
      <div className="w-full max-w-6xl bg-white border border-black/[0.04] rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.06)] p-5 md:p-7 select-none">
        
        {/* Top bar: Tabs and Post Property */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-5">
          {/* Tabs */}
          <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100/80">
            {(["buy", "rent", "pg-hostel"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-xs md:text-[13px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                {tab === "pg-hostel" ? "PG / HOSTEL" : tab}
              </button>
            ))}
          </div>

          {/* Post Property button with FREE badge */}
          <button
            onClick={handlePostProperty}
            className="relative flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-2xl text-[13px] font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 group cursor-pointer"
          >
            <Home className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>POST YOUR PROPERTY</span>
            {/* Free Badge */}
            <span className="absolute -top-3 -right-3 bg-red-500 text-[9px] font-black uppercase text-white px-2 py-0.5 rounded-full rotate-12 shadow-sm border border-white">
              FREE
            </span>
          </button>
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 items-end">
          
          {/* State */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">STATE</label>
            <div className="relative">
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl px-3.5 py-3 text-xs md:text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* District */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">DISTRICT</label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl px-3.5 py-3 text-xs md:text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="Coimbatore">Coimbatore</option>
                <option value="Chennai">Chennai</option>
                <option value="Madurai">Madurai</option>
                <option value="Salem">Salem</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* City / Town */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">CITY / TOWN</label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl px-3.5 py-3 text-xs md:text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="Select City">Select City</option>
                <option value="Saravanampatti">Saravanampatti</option>
                <option value="Kovaipudur">Kovaipudur</option>
                <option value="Peelamedu">Peelamedu</option>
                <option value="RS Puram">RS Puram</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Property Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">PROPERTY TYPE</label>
            <div className="relative">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl px-3.5 py-3 text-xs md:text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
              >
                <option value="Select Property Type">Select Type</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Villa Plot</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Budget / Search */}
          <div className="flex flex-col gap-5 md:flex-row md:items-end">
            <div className="flex flex-col gap-1.5 flex-grow">
              <label className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">BUDGET</label>
              <div className="relative">
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200/80 hover:border-slate-300 rounded-xl px-3.5 py-3 text-xs md:text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
                >
                  <option value="Select Budget">Select Budget</option>
                  <option value="< 50 Lakhs">Under ?50 Lakhs</option>
                  <option value="50 Lakhs - 1.5 Crore">?50 Lakhs - ?1.5 Cr</option>
                  <option value="> 1.5 Crore">Over ?1.5 Crore</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer w-full md:w-auto"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
