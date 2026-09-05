import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
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

  const visibleResidential = showMoreResidential ? RESIDENTIAL_TYPES : RESIDENTIAL_TYPES.slice(0, 5);
  const hiddenResidentialCount = RESIDENTIAL_TYPES.length - 5;

  const visibleCommercial = showMoreCommercial ? COMMERCIAL_TYPES : COMMERCIAL_TYPES.slice(0, 4);
  const hiddenCommercialCount = COMMERCIAL_TYPES.length - 4;

  const areaOptions = PROPERTY_AREAS_MAPPING[filters.state]?.[filters.district] || [];

  return (
    <div className="bg-white border border-zinc-200/90 rounded-[28px] p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.05)] text-[#141414] select-none flex flex-col gap-5 max-h-[85vh] md:max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar-light font-outfit group">
      
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
              className="md:hidden p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-slate-600"
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
        <div className="relative">
          <select
            value={filters.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full appearance-none bg-white border border-zinc-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#141414] cursor-pointer pr-8 shadow-2xs font-outfit"
          >
            <option value="">Select State</option>
            {Object.keys(INDIA_STATES_AND_DISTRICTS).sort().map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* District */}
        {filters.state && (
          <div className="relative">
            <select
              value={filters.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full appearance-none bg-white border border-zinc-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#141414] cursor-pointer pr-8 shadow-2xs font-outfit"
            >
              <option value="">Select District</option>
              {(INDIA_STATES_AND_DISTRICTS[filters.state] || []).map((dt) => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* City / Area */}
        {filters.district && areaOptions.length > 0 && (
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
              className="w-full appearance-none bg-white border border-zinc-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#141414] cursor-pointer pr-8 shadow-2xs font-outfit"
            >
              <option value="">Any Area / Locality</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* 4. BUDGET */}
      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 font-outfit">
        <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
          BUDGET
        </label>
        <div className="relative">
          <select
            value={filters.budget || "Any Budget"}
            onChange={(e) => onFilterChange({ ...filters, budget: e.target.value })}
            className="w-full appearance-none bg-white border border-zinc-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#141414] cursor-pointer pr-8 shadow-2xs font-outfit"
          >
            {getBudgetOptions().map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
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
        <div className="relative">
          <select
            value={filters.areaSize || "Any size"}
            onChange={(e) => onFilterChange({ ...filters, areaSize: e.target.value })}
            className="w-full appearance-none bg-white border border-zinc-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#141414] cursor-pointer pr-8 shadow-2xs font-outfit"
          >
            {getAreaSizeOptions().map((sizeOpt) => (
              <option key={sizeOpt} value={sizeOpt}>{sizeOpt}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
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
  );
}
