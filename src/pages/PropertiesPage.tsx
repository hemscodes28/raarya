import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyDetailModal } from '../components/PropertyDetailModal';
import { PropertyFilterPanel, type FilterState } from '../components/PropertyFilterPanel';
import { PROPERTIES, type PropertyListing } from '../constants';

interface PropertiesPageProps {
  initialTab?: 'all' | 'buy' | 'rent' | 'pg-hostel';
}

const DEFAULT_FILTERS: FilterState = {
  tab: 'all',
  state: '',
  district: '',
  city: '',
  propertyType: '',
  budget: 'Any Budget',
  areaUnit: 'Sq.Ft',
  areaSize: 'Any size',
  constructionStatus: 'Any',
};

export function PropertiesPage({ initialTab = 'all' }: PropertiesPageProps) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    tab: initialTab,
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(18);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync initial tab from URL hash / prop changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, tab: initialTab }));
    setVisibleCount(18);

    // Read stored filters from session storage if available
    const stored = sessionStorage.getItem('raarya_search_filters');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFilters((prev) => ({
          ...prev,
          tab: initialTab !== 'all' ? initialTab : (parsed.tab || 'all'),
          state: parsed.state || '',
          district: parsed.district || '',
          city: parsed.city && parsed.city !== 'Select City' ? parsed.city : '',
          propertyType: parsed.propertyType && parsed.propertyType !== 'Select Property Type' ? parsed.propertyType : '',
          budget: parsed.budget && parsed.budget !== 'Select Budget' ? parsed.budget : 'Any Budget',
        }));
      } catch (e) {
        console.error('Failed to parse search filters', e);
      }
    }
  }, [initialTab]);

  // Persist filter changes to sessionStorage
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setVisibleCount(18);
    sessionStorage.setItem('raarya_search_filters', JSON.stringify(newFilters));
    if (newFilters.tab !== filters.tab && newFilters.tab !== 'all') {
      window.location.hash = `#${newFilters.tab}`;
    }
  };

  const handleClearAll = () => {
    const reset: FilterState = {
      ...DEFAULT_FILTERS,
      tab: filters.tab,
    };
    setFilters(reset);
    setSearchTerm('');
    setVisibleCount(18);
    sessionStorage.removeItem('raarya_search_filters');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.state) count++;
    if (filters.district) count++;
    if (filters.city) count++;
    if (filters.propertyType) count++;
    if (filters.budget && filters.budget !== 'Any Budget') count++;
    if (filters.areaSize && filters.areaSize !== 'Any size') count++;
    if (filters.constructionStatus && filters.constructionStatus !== 'Any') count++;
    return count;
  }, [filters]);

  const filtered = useMemo(() => {
    return PROPERTIES.filter((p) => {
      // 1. Tab Match
      if (filters.tab !== 'all' && p.type !== filters.tab) {
        return false;
      }

      // 2. Search Term Match
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesLoc = p.location.toLowerCase().includes(term);
        const matchesSubType = p.subType ? p.subType.toLowerCase().includes(term) : false;
        if (!matchesTitle && !matchesLoc && !matchesSubType) return false;
      }

      // 3. Location Parse (State, District, City)
      if (p.location) {
        const parts = p.location.split(',').map((s) => s.trim());
        const st = parts.length > 0 ? parts[parts.length - 1] : '';
        const dt = parts.length > 1 ? parts[parts.length - 2] : '';
        let ct = parts.length > 2 ? parts.slice(0, parts.length - 2).join(', ').trim() : '';
        if (ct.includes('-')) {
          const dashParts = ct.split('-');
          const potentialCity = dashParts[0].trim();
          if (potentialCity) ct = potentialCity;
        }

        if (filters.state && st.toLowerCase() !== filters.state.toLowerCase()) {
          return false;
        }
        if (filters.district && dt.toLowerCase() !== filters.district.toLowerCase()) {
          return false;
        }
        if (filters.city && !ct.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
      }

      // 4. Property Type Match
      if (filters.propertyType) {
        const targetType = filters.propertyType.toLowerCase();
        const subTypeLower = p.subType ? p.subType.toLowerCase() : '';
        const titleLower = p.title.toLowerCase();

        const matchesType =
          subTypeLower.includes(targetType) ||
          titleLower.includes(targetType) ||
          (targetType === 'flat' && (subTypeLower.includes('apartment') || titleLower.includes('apartment'))) ||
          (targetType === 'house' && (subTypeLower.includes('villa') || titleLower.includes('house'))) ||
          (targetType === 'plot' && (subTypeLower.includes('land') || titleLower.includes('dtcp')));

        if (!matchesType) return false;
      }

      // 5. Budget Match
      if (filters.budget && filters.budget !== 'Any Budget') {
        let priceNum = 0;
        if (p.price) {
          const normalizedPrice = p.price.replace(/,,/g, ',');
          const clean = normalizedPrice.replace(/[^\d]/g, '');
          priceNum = parseInt(clean, 10) || 0;
        }

        if (filters.tab === 'buy' || p.type === 'buy') {
          if (filters.budget.includes('Under')) {
            if (priceNum >= 5000000) return false;
          } else if (filters.budget.includes('-')) {
            if (priceNum < 5000000 || priceNum > 15000000) return false;
          } else if (filters.budget.includes('Over')) {
            if (priceNum <= 15000000) return false;
          }
        } else if (filters.tab === 'rent' || p.type === 'rent') {
          if (filters.budget.includes('Under')) {
            if (priceNum >= 15000) return false;
          } else if (filters.budget.includes('-')) {
            if (priceNum < 15000 || priceNum > 30000) return false;
          } else if (filters.budget.includes('Over')) {
            if (priceNum <= 30000) return false;
          }
        } else if (filters.tab === 'pg-hostel' || p.type === 'pg-hostel') {
          if (filters.budget.includes('Under')) {
            if (priceNum >= 8000) return false;
          } else if (filters.budget.includes('-')) {
            if (priceNum < 8000 || priceNum > 15000) return false;
          } else if (filters.budget.includes('Over')) {
            if (priceNum <= 15000) return false;
          }
        }
      }

      // 6. Area Match (Unit & Size)
      if (filters.areaSize && filters.areaSize !== 'Any size') {
        if (filters.areaUnit === 'BHK') {
          const bhkNum = parseInt(filters.areaSize.replace(/[^\d]/g, ''), 10);
          if (bhkNum && p.beds && p.beds !== bhkNum) return false;
        } else {
          const areaVal = p.area || 0;
          if (filters.areaSize.includes('Under 1000') && areaVal >= 1000) return false;
          if (filters.areaSize.includes('1000 - 2500') && (areaVal < 1000 || areaVal > 2500)) return false;
          if (filters.areaSize.includes('2500 - 5000') && (areaVal < 2500 || areaVal > 5000)) return false;
          if (filters.areaSize.includes('Above 5000') && areaVal <= 5000) return false;
        }
      }

      // 7. Construction Status Match
      if (filters.constructionStatus && filters.constructionStatus !== 'Any') {
        const status = filters.constructionStatus.toLowerCase();
        const fullText = `${p.title} ${p.subType || ''} ${p.description || ''} ${JSON.stringify(p.overviewDetails || {})}`.toLowerCase();
        if (status === 'ready to move' && !fullText.includes('ready') && !fullText.includes('immediate')) {
          // If it's a plot or completed house, count as ready
          if (!fullText.includes('plot') && !fullText.includes('land') && fullText.includes('under construction')) {
            return false;
          }
        } else if (status === 'under construction' && !fullText.includes('under construction') && !fullText.includes('possession')) {
          return false;
        } else if (status === 'new launch' && !fullText.includes('new launch') && !fullText.includes('dtcp')) {
          return false;
        }
      }

      return true;
    });
  }, [filters, searchTerm]);

  const pageTitle =
    filters.tab === 'buy'
      ? 'Buy Properties (Plots, Villas & Houses)'
      : filters.tab === 'rent'
      ? 'Rental Properties in Coimbatore'
      : filters.tab === 'pg-hostel'
      ? 'PG & Hostel Accommodations'
      : 'All Curated Properties';

  const pageSubtitle =
    filters.tab === 'buy'
      ? 'Explore DTCP & RERA approved plot layouts, individual villas, and commercial land available for purchase.'
      : filters.tab === 'rent'
      ? 'Browse verified residential flats, houses, and commercial office spaces available for rent.'
      : filters.tab === 'pg-hostel'
      ? 'Executive mens PGs, luxury girls PGs, and student hostels with food and amenities.'
      : 'Browse our complete inventory of residential and commercial properties.';

  return (
    <PageShell title={pageTitle} subtitle={pageSubtitle}>
      {/* Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* Main Container Layout: 2 Columns on Desktop */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Desktop PropertyFilterPanel Sidebar (Sticky Pinned & Wider Width) */}
        <aside className="hidden lg:block w-[350px] lg:w-[360px] shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar-light pr-1">
          <PropertyFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />
        </aside>

        {/* Right Column: Search Bar, Mobile Filter Trigger, Grid */}
        <div className="flex-1 w-full min-w-0">
          
          {/* Top Search & Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border border-zinc-200 p-3 sm:p-4 rounded-3xl shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, location, landmark (e.g. Saravanampatti)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(18);
                }}
                className="w-full bg-slate-50 border border-zinc-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#141414] focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-blue-500/20 shrink-0 cursor-pointer transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter Properties</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Tags */}
          {(activeFiltersCount > 0 || searchTerm) && (
            <div className="mb-6 flex flex-wrap items-center gap-2 bg-slate-50 border border-zinc-200/80 p-3 sm:p-4 rounded-2xl select-none">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Active Filters:</span>
              
              {searchTerm && (
                <span className="bg-white border border-zinc-200 text-slate-800 px-3 py-1 text-xs rounded-xl font-bold shadow-sm flex items-center gap-1.5">
                  Search: "{searchTerm}"
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-800 cursor-pointer" onClick={() => setSearchTerm('')} />
                </span>
              )}

              {filters.tab !== 'all' && (
                <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 text-xs rounded-xl font-bold shadow-sm">
                  Tab: {filters.tab.toUpperCase()}
                </span>
              )}

              {filters.propertyType && (
                <span className="bg-white border border-zinc-200 text-slate-800 px-3 py-1 text-xs rounded-xl font-bold shadow-sm flex items-center gap-1.5">
                  Type: {filters.propertyType}
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-800 cursor-pointer" onClick={() => handleFilterChange({ ...filters, propertyType: '' })} />
                </span>
              )}

              {filters.state && (
                <span className="bg-white border border-zinc-200 text-slate-800 px-3 py-1 text-xs rounded-xl font-bold shadow-sm flex items-center gap-1.5">
                  State: {filters.state}
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-800 cursor-pointer" onClick={() => handleFilterChange({ ...filters, state: '', district: '', city: '' })} />
                </span>
              )}

              {filters.district && (
                <span className="bg-white border border-zinc-200 text-slate-800 px-3 py-1 text-xs rounded-xl font-bold shadow-sm flex items-center gap-1.5">
                  District: {filters.district}
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-800 cursor-pointer" onClick={() => handleFilterChange({ ...filters, district: '', city: '' })} />
                </span>
              )}

              {filters.city && (
                <span className="bg-white border border-zinc-200 text-slate-800 px-3 py-1 text-xs rounded-xl font-bold shadow-sm flex items-center gap-1.5">
                  Area: {filters.city}
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-800 cursor-pointer" onClick={() => handleFilterChange({ ...filters, city: '' })} />
                </span>
              )}

              {filters.budget && filters.budget !== 'Any Budget' && (
                <span className="bg-white border border-zinc-200 text-slate-800 px-3 py-1 text-xs rounded-xl font-bold shadow-sm flex items-center gap-1.5">
                  Budget: {filters.budget}
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-800 cursor-pointer" onClick={() => handleFilterChange({ ...filters, budget: 'Any Budget' })} />
                </span>
              )}

              {filters.areaSize && filters.areaSize !== 'Any size' && (
                <span className="bg-white border border-zinc-200 text-slate-800 px-3 py-1 text-xs rounded-xl font-bold shadow-sm flex items-center gap-1.5">
                  Size: {filters.areaSize} ({filters.areaUnit})
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-800 cursor-pointer" onClick={() => handleFilterChange({ ...filters, areaSize: 'Any size' })} />
                </span>
              )}

              {filters.constructionStatus && filters.constructionStatus !== 'Any' && (
                <span className="bg-white border border-zinc-200 text-slate-800 px-3 py-1 text-xs rounded-xl font-bold shadow-sm flex items-center gap-1.5">
                  Status: {filters.constructionStatus}
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-800 cursor-pointer" onClick={() => handleFilterChange({ ...filters, constructionStatus: 'Any' })} />
                </span>
              )}

              <button
                type="button"
                onClick={handleClearAll}
                className="ml-auto text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>
          )}

          {/* Properties Count Sub-header */}
          <div className="mb-6 flex items-center justify-between border-b border-zinc-200/80 pb-3">
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-[#141414]">{Math.min(visibleCount, filtered.length)}</span> of{' '}
              <span className="font-bold text-[#141414]">{filtered.length}</span> verified properties
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.slice(0, visibleCount).map((property, i) => (
              <motion.div
                key={property.id || `${property.title}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.04, duration: 0.35 }}
                className="h-full flex flex-col"
              >
                <PropertyCard
                  property={property}
                  onClick={() => setSelectedProperty(property)}
                />
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="py-16 text-center bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-[#141414]">No properties match your filter criteria.</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing specific filters like budget or property type to view available listings.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="mt-5 px-6 py-2.5 text-xs font-bold bg-[#141414] text-white rounded-xl hover:bg-black transition-all shadow-md cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < filtered.length && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 18)}
                className="px-8 py-3 bg-[#141414] hover:bg-black text-white text-xs font-bold tracking-wider uppercase rounded-2xl shadow-lg transition-all duration-300 active:scale-95 cursor-pointer"
              >
                Load More Properties ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Slide-over Modal (Android & iOS) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[99999] flex justify-end lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl p-4 overflow-y-auto z-10"
            >
              <PropertyFilterPanel
                filters={filters}
                onFilterChange={(newF) => {
                  handleFilterChange(newF);
                }}
                onClearAll={handleClearAll}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
