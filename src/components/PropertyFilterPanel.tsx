import { useState, useRef, useEffect, useMemo } from "react";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { INDIA_STATES_AND_DISTRICTS, PROPERTY_AREAS_MAPPING } from "../data/indiaData";

export interface FilterState {
  tab: "all" | "buy" | "rent" | "pg-hostel";
  state: string;
  district: string;
  city: string;
  propertyType: string;
  budget: string;
  areaUnit: string;
  areaSize: string;
  constructionStatus: string;
}

interface PropertyFilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearAll: () => void;
  onCloseMobile?: () => void;
}

const RESIDENTIAL_TYPES = ["Flat", "Villa", "Plot", "House", "Builder Floor", "Farm House", "Penthouse"];
const COMMERCIAL_TYPES = ["Office Space", "Shop", "Showroom", "Warehouse", "Godown", "Commercial Land"];
const AREA_UNITS = ["Sq.Ft", "Sq.m", "Cent", "Acre", "BHK"];
const CONSTRUCTION_STATUSES = ["Any", "Ready to Move", "Under Construction", "New Launch"];

// --- Ultra-Premium Luxury Dropdown Component ---
interface LuxuryDropdownProps {
  placeholder: string;
  value: string;
  options: { label: string; value: string }[] | string[];
  onChange: (val: string) => void;
  enableSearch?: boolean;
}

function LuxuryDropdown({ placeholder, value, options, onChange, enableSearch = false }: LuxuryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption && selectedOption.value ? selectedOption.label : placeholder;

  return (
    <div className="relative w-full font-outfit" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white hover:bg-slate-50/80 border rounded-2xl px-4 py-2.5 sm:py-3 text-xs font-bold transition-all duration-200 flex items-center justify-between shadow-2xs cursor-pointer ${
          isOpen
            ? "border-[#c5a880] ring-2 ring-[#c5a880]/20 text-[#141414]"
            : value && value !== placeholder && !value.startsWith("Select") && !value.startsWith("Any")
            ? "border-[#c5a880]/80 text-[#141414] bg-[#fefcf8]"
            : "border-zinc-200 text-slate-700 hover:border-zinc-300"
        }`}
      >
        <span className="truncate pr-2">
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#c5a880]" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#c5a880]/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12),_0_2px_10px_rgba(197,168,128,0.15)] z-[100] py-2 flex flex-col max-h-72 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 font-outfit">
          {/* Optional Search Filter Input */}
          {(enableSearch || normalizedOptions.length > 6) && (
            <div className="px-3 pb-2 pt-1 border-b border-zinc-100 mb-1">
              <input
                type="text"
                placeholder="Type to filter options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#c5a880] text-slate-800 placeholder:text-slate-400"
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-56 custom-scrollbar-light flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 italic">No matches found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#141414] text-[#e8d5b7]"
                        : "text-slate-700 hover:bg-[#fefaf3] hover:text-[#141414]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#c5a880]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PropertyFilterPanel({
  filters,
  onFilterChange,
  onClearAll,
  onCloseMobile,
}: PropertyFilterPanelProps) {
  const [showMoreResidential, setShowMoreResidential] = useState(false);
  const [showMoreCommercial, setShowMoreCommercial] = useState(false);

  const handleTabChange = (tab: "buy" | "rent" | "pg-hostel") => {
    onFilterChange({
      ...filters,
      tab,
      budget: "Any Budget",
    });
  };

  const handlePropertyTypeToggle = (type: string) => {
    const newType = filters.propertyType === type ? "" : type;
    onFilterChange({ ...filters, propertyType: newType });
  };

  const handleStateChange = (state: string) => {
    const districts = INDIA_STATES_AND_DISTRICTS[state] || [];
    const defaultDistrict = state === "Tamil Nadu" && districts.includes("Coimbatore") ? "Coimbatore" : districts[0] || "";
    onFilterChange({
      ...filters,
      state,
      district: defaultDistrict,
      city: "",
    });
  };

  const handleDistrictChange = (district: string) => {
    onFilterChange({
      ...filters,
      district,
      city: "",
    });
  };

  const getBudgetOptions = () => {
    if (filters.tab === "buy") {
      return ["Any Budget", "Under ₹50 L", "₹50 L - ₹1.5 Cr", "Over ₹1.5 Cr"];
    } else if (filters.tab === "rent") {
      return ["Any Budget", "Under ₹15,000", "₹15,000 - ₹30,000", "Over ₹30,000"];
    } else {
      return ["Any Budget", "Under ₹8,000", "₹8,000 - ₹15,000", "Over ₹15,000"];
    }
  };

  const getAreaSizeOptions = () => {
    if (filters.areaUnit === "BHK") {
      return ["Any size", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"];
    }
    return ["Any size", "Under 1000", "1000 - 2500", "2500 - 5000", "Above 5000"];
  };

  const stateOptions = useMemo(() => ["Select State", ...Object.keys(INDIA_STATES_AND_DISTRICTS).sort()], []);

  const districtOptions = useMemo(() => {
    if (!filters.state) return ["Select District"];
    return ["Select District", ...(INDIA_STATES_AND_DISTRICTS[filters.state] || [])];
  }, [filters.state]);

  const visibleResidential = showMoreResidential ? RESIDENTIAL_TYPES : RESIDENTIAL_TYPES.slice(0, 5);
  const hiddenResidentialCount = RESIDENTIAL_TYPES.length - 5;

  const visibleCommercial = showMoreCommercial ? COMMERCIAL_TYPES : COMMERCIAL_TYPES.slice(0, 4);
  const hiddenCommercialCount = COMMERCIAL_TYPES.length - 4;

  const areaOptions = PROPERTY_AREAS_MAPPING[filters.state]?.[filters.district] || [];

  return (
    <div className="w-full h-full bg-white text-[#141414] select-none flex flex-col justify-between md:border md:border-zinc-200/90 md:rounded-[28px] md:shadow-[0_10px_35px_rgba(0,0,0,0.05)] md:max-h-[calc(100vh-140px)] font-outfit group overflow-hidden">
      
      {/* Scrollable Filter Body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5 custom-scrollbar-light">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#141414] text-[#c5a880] flex items-center justify-center shadow-sm shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#c5a880]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#141414] font-outfit">
                Filter Properties
              </h2>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#a3865e] font-outfit">
                RAARYA SELECTION
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer font-outfit"
            >
              <span>✕ Clear All</span>
            </button>
            
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1. LOOKING TO */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400 font-outfit">
            LOOKING TO
          </label>
          <div className="grid grid-cols-3 p-1 bg-zinc-100/90 rounded-full border border-zinc-200/60 font-outfit">
            {(["buy", "rent", "pg-hostel"] as const).map((tab) => {
              const isActive = filters.tab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`py-2 text-xs font-bold tracking-wide rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#141414] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {tab === "buy" ? "Buy" : tab === "rent" ? "Rent" : "PG / Hostel"}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. PROPERTY TYPE */}
        <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400 font-outfit">
            PROPERTY TYPE
          </label>

          {/* Residential */}
          <div className="flex flex-col gap-2 font-outfit">
            <span className="text-xs font-bold text-slate-500">Residential</span>
            <div className="flex flex-wrap gap-2">
              {visibleResidential.map((type) => {
                const isSelected = filters.propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePropertyTypeToggle(type)}
                    className={`px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#141414] text-white border-[#141414] shadow-xs"
                        : "bg-white text-slate-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
              {!showMoreResidential && hiddenResidentialCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowMoreResidential(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-dashed border-blue-300 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  +{hiddenResidentialCount} more
                </button>
              )}
            </div>
          </div>

          {/* Commercial */}
          <div className="flex flex-col gap-2 font-outfit">
            <span className="text-xs font-bold text-slate-500">Commercial</span>
            <div className="flex flex-wrap gap-2">
              {visibleCommercial.map((type) => {
                const isSelected = filters.propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePropertyTypeToggle(type)}
                    className={`px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#141414] text-white border-[#141414] shadow-xs"
                        : "bg-white text-slate-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
              {!showMoreCommercial && hiddenCommercialCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowMoreCommercial(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-dashed border-blue-300 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  +{hiddenCommercialCount} more
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. LOCATION */}
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 font-outfit">
          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            LOCATION
          </label>
          
          {/* State */}
          <LuxuryDropdown
            placeholder="Select State"
            value={filters.state}
            options={stateOptions}
            onChange={(val) => handleStateChange(val === "Select State" ? "" : val)}
            enableSearch
          />

          {/* District */}
          {filters.state && (
            <LuxuryDropdown
              placeholder="Select District"
              value={filters.district}
              options={districtOptions}
              onChange={(val) => handleDistrictChange(val === "Select District" ? "" : val)}
              enableSearch
            />
          )}

          {/* City / Area */}
          {filters.district && areaOptions.length > 0 && (
            <LuxuryDropdown
              placeholder="Any Area / Locality"
              value={filters.city}
              options={["Any Area / Locality", ...areaOptions]}
              onChange={(val) => onFilterChange({ ...filters, city: val === "Any Area / Locality" ? "" : val })}
              enableSearch
            />
          )}
        </div>

        {/* 4. BUDGET */}
        <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 font-outfit">
          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            BUDGET
          </label>
          <LuxuryDropdown
            placeholder="Any Budget"
            value={filters.budget || "Any Budget"}
            options={getBudgetOptions()}
            onChange={(val) => onFilterChange({ ...filters, budget: val })}
          />
        </div>

        {/* 5. AREA */}
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 font-outfit">
          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            AREA
          </label>
          
          {/* Units Selector */}
          <div className="flex flex-wrap gap-2">
            {AREA_UNITS.map((unit) => {
              const isSelected = (filters.areaUnit || "Sq.Ft") === unit;
              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, areaUnit: unit, areaSize: "Any size" })}
                  className={`px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#141414] text-white border-[#141414] shadow-xs"
                      : "bg-white text-slate-700 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {unit}
                </button>
              );
            })}
          </div>

          {/* Area Size Dropdown */}
          <LuxuryDropdown
            placeholder="Any size"
            value={filters.areaSize || "Any size"}
            options={getAreaSizeOptions()}
            onChange={(val) => onFilterChange({ ...filters, areaSize: val })}
          />
        </div>

        {/* 6. CONSTRUCTION STATUS */}
        <div className="flex flex-col gap-2.5 border-t border-zinc-100 pt-4 pb-2 font-outfit">
          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            CONSTRUCTION STATUS
          </label>
          <div className="flex flex-wrap gap-2">
            {CONSTRUCTION_STATUSES.map((status) => {
              const isSelected = (filters.constructionStatus || "Any") === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, constructionStatus: status })}
                  className={`px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#141414] text-white border-[#141414] shadow-xs"
                      : "bg-white text-slate-700 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Apply Button */}
      {onCloseMobile && (
        <div className="p-4 border-t border-zinc-100 bg-white sticky bottom-0 z-20 shadow-[0_-10px_25px_rgba(0,0,0,0.05)] md:hidden">
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-full py-3.5 px-6 bg-[#141414] hover:bg-black text-[#e8d5b7] font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <span>Apply Filters & View Properties</span>
          </button>
        </div>
      )}

    </div>
  );
}
