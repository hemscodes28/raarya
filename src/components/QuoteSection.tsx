import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Home, ChevronDown, Check } from "lucide-react";

// --- Custom Select Dropdown Component for Premium Feel ---
interface CustomSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 lg:col-span-2 relative" ref={containerRef}>
      <label className="text-[9px] font-extrabold tracking-wider uppercase text-slate-400 select-none">
        {label}
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl px-3.5 py-3 text-xs md:text-[13px] font-semibold text-slate-700 flex items-center justify-between transition-all duration-300 shadow-sm cursor-pointer"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-xs md:text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-black flex items-center justify-between transition-colors duration-200 cursor-pointer"
            >
              <span>{option}</span>
              {value === option && <Check className="w-3.5 h-3.5 text-[#141414]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuoteSection() {
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "pg-hostel">("buy");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Coimbatore");
  const [city, setCity] = useState("Select City");
  const [propertyType, setPropertyType] = useState("Select Property Type");
  const [budget, setBudget] = useState("Select Budget");

  const handleSearch = () => {
    window.location.hash = activeTab;
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
            � Will Rogers
          </span>
        </p>
      </div>

      {/* 2. Premium Real Estate Search Widget - Black & White minimalist theme with distinct light background and clear border */}
      <div className="w-full max-w-6xl bg-zinc-50 border border-zinc-200 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5 md:p-7 select-none">
        
        {/* Top bar: Tabs and Post Property */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-zinc-200 pb-5">
          
          {/* Tabs */}
          <div className="flex gap-4 bg-white px-4 py-2 rounded-2xl border border-zinc-200/80 items-center shadow-sm">
            {(["buy", "rent", "pg-hostel"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs md:text-[13px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#141414] text-white shadow-md shadow-black/10"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab === "pg-hostel" ? "PG / HOSTEL" : tab === "rent" ? "RENT" : "BUY"}
              </button>
            ))}
          </div>

          {/* Post Property button with FREE badge (Black theme & innovative floating animation) */}
          <motion.button
            onClick={handlePostProperty}
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.975 }}
            className="relative flex items-center gap-2 bg-[#141414] hover:bg-[#1f1f1f] text-white px-5 py-2.5 rounded-2xl text-[13px] font-bold shadow-lg shadow-black/10 transition-colors duration-300 group cursor-pointer border border-white/5"
          >
            {/* Inner Shimmer Container to support overflow-hidden */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </div>

            <Home className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 relative z-10" />
            <span className="tracking-wide relative z-10">POST YOUR PROPERTY</span>

            {/* Innovative Floating & Pulsing FREE Badge */}
            <motion.span
              animate={{ 
                y: [0, -4, 0],
                scale: [1, 1.06, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.2, 
                ease: "easeInOut" 
              }}
              className="absolute -top-3 -right-2 bg-gradient-to-r from-rose-500 to-red-600 text-[9px] font-black uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full shadow-[0_4px_12px_rgba(239,68,68,0.4)] border border-white select-none pointer-events-none z-20"
            >
              FREE
            </motion.span>
          </motion.button>
        </div>

        {/* Filters grid: 12-column layout to prevent column squeezing with Custom dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          
          {/* State */}
          <CustomSelect
            label="STATE"
            value={state}
            options={["Tamil Nadu", "Karnataka", "Kerala"]}
            onChange={setState}
          />

          {/* District */}
          <CustomSelect
            label="DISTRICT"
            value={district}
            options={["Coimbatore", "Chennai", "Madurai", "Salem"]}
            onChange={setDistrict}
          />

          {/* City / Town */}
          <CustomSelect
            label="CITY / TOWN"
            value={city}
            options={["Select City", "Saravanampatti", "Kovaipudur", "Peelamedu", "RS Puram"]}
            onChange={setCity}
          />

          {/* Property Type */}
          <CustomSelect
            label="PROPERTY TYPE"
            value={propertyType}
            options={["Select Property Type", "Villa", "Plot", "Apartment", "Commercial"]}
            onChange={setPropertyType}
          />

          {/* Budget */}
          <CustomSelect
            label="BUDGET"
            value={budget}
            options={["Select Budget", "Under ?50 L", "?50 L - ?1.5 Cr", "Over ?1.5 Cr"]}
            onChange={setBudget}
          />

          {/* Search Button (Separate column, black theme) */}
          <div className="lg:col-span-2">
            <button
              onClick={handleSearch}
              className="bg-[#141414] hover:bg-[#202020] text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer w-full"
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
