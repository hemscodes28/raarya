import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyDetailModal } from '../components/PropertyDetailModal';
import { PROPERTIES, type PropertyListing } from '../constants';

interface PropertiesPageProps {
  initialTab?: 'all' | 'buy' | 'rent' | 'pg-hostel';
}

export function PropertiesPage({ initialTab = 'all' }: PropertiesPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'buy' | 'rent' | 'pg-hostel'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(18);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
    setVisibleCount(18);

    // Load filters from session storage
    const stored = sessionStorage.getItem('raarya_search_filters');
    if (stored) {
      try {
        const filters = JSON.parse(stored);
        if (filters.tab === initialTab || initialTab === 'all') {
          setStateFilter(filters.state || '');
          setDistrictFilter(filters.district || '');
          setCityFilter(filters.city || '');
          setPropertyTypeFilter(filters.propertyType || '');
          setBudgetFilter(filters.budget || '');
        } else {
          // Clear filters if user navigated to a different tab manually
          setStateFilter('');
          setDistrictFilter('');
          setCityFilter('');
          setPropertyTypeFilter('');
          setBudgetFilter('');
        }
      } catch (e) {
        console.error('Failed to parse search filters', e);
      }
    } else {
      setStateFilter('');
      setDistrictFilter('');
      setCityFilter('');
      setPropertyTypeFilter('');
      setBudgetFilter('');
    }
  }, [initialTab]);

  const filtered = useMemo(() => {
    return PROPERTIES.filter((p) => {
      // 1. Tab Match
      const matchesTab = activeTab === 'all' || p.type === activeTab;
      
      // 2. Text Search Term Match
      const matchesSearch =
        searchTerm === '' ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.subType && p.subType.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesTab || !matchesSearch) return false;

      // 3. Location Parse
      let parsed = { state: '', district: '', city: '' };
      if (p.location) {
        const parts = p.location.split(',').map(s => s.trim());
        const st = parts.length > 0 ? parts[parts.length - 1] : '';
        const dt = parts.length > 1 ? parts[parts.length - 2] : '';
        let ct = parts.length > 2 ? parts.slice(0, parts.length - 2).join(', ').trim() : '';
        if (ct.includes('-')) {
          const dashParts = ct.split('-');
          const potentialCity = dashParts[0].trim();
          if (potentialCity) ct = potentialCity;
        }
        parsed = {
          state: st.toLowerCase(),
          district: dt.toLowerCase(),
          city: ct.replace(/^,/, '').trim().toLowerCase()
        };
      }

      // 4. State Match
      if (stateFilter && stateFilter !== 'Select State' && parsed.state !== stateFilter.toLowerCase()) {
        return false;
      }

      // 5. District Match
      if (districtFilter && districtFilter !== 'Select District' && parsed.district !== districtFilter.toLowerCase()) {
        return false;
      }

      // 6. City Match
      if (cityFilter && cityFilter !== 'Select City' && cityFilter !== 'Select City / Town' && parsed.city !== cityFilter.toLowerCase()) {
        return false;
      }

      // 7. Property Type Match
      if (propertyTypeFilter && propertyTypeFilter !== 'Select Property Type') {
        const propTypeLower = propertyTypeFilter.toLowerCase();
        const subTypeLower = p.subType ? p.subType.toLowerCase() : '';
        
        if (propTypeLower === 'commercial') {
          const isCommercial = ['commercial land', 'shop', 'office space', 'showroom', 'godown', 'warehouse', 'industrial land'].some(c => subTypeLower.includes(c));
          if (!isCommercial) return false;
        } else if (propTypeLower === 'house') {
          const isHouse = ['house', 'independent house', 'villa', 'builder floor', 'farm house'].some(h => subTypeLower.includes(h));
          if (!isHouse) return false;
        } else {
          if (subTypeLower !== propTypeLower && !subTypeLower.includes(propTypeLower)) {
            return false;
          }
        }
      }

      // 8. Budget Match
      if (budgetFilter && budgetFilter !== 'Select Budget') {
        let priceNum = 0;
        if (p.price) {
          const normalizedPrice = p.price.replace(/,,/g, ',');
          const clean = normalizedPrice.replace(/[^\d]/g, '');
          priceNum = parseInt(clean, 10) || 0;
        }

        if (p.type === 'buy') {
          if (budgetFilter.includes('Under')) {
            if (priceNum >= 5000000) return false;
          } else if (budgetFilter.includes('-')) {
            if (priceNum < 5000000 || priceNum > 15000000) return false;
          } else if (budgetFilter.includes('Over')) {
            if (priceNum <= 15000000) return false;
          }
        } else if (p.type === 'rent') {
          if (budgetFilter.includes('Under')) {
            if (priceNum >= 15000) return false;
          } else if (budgetFilter.includes('-')) {
            if (priceNum < 15000 || priceNum > 30000) return false;
          } else if (budgetFilter.includes('Over')) {
            if (priceNum <= 30000) return false;
          }
        } else if (p.type === 'pg-hostel') {
          if (budgetFilter.includes('Under')) {
            if (priceNum >= 8000) return false;
          } else if (budgetFilter.includes('-')) {
            if (priceNum < 8000 || priceNum > 15000) return false;
          } else if (budgetFilter.includes('Over')) {
            if (priceNum <= 15000) return false;
          }
        }
      }

      return true;
    });
  }, [activeTab, searchTerm, stateFilter, districtFilter, cityFilter, propertyTypeFilter, budgetFilter]);

  const buyCount = useMemo(() => PROPERTIES.filter((p) => p.type === 'buy').length, []);
  const rentCount = useMemo(() => PROPERTIES.filter((p) => p.type === 'rent').length, []);
  const pgCount = useMemo(() => PROPERTIES.filter((p) => p.type === 'pg-hostel').length, []);

  const tabs = [
    { id: 'buy', label: `Buy (${buyCount})` },
    { id: 'rent', label: `Rent (${rentCount})` },
    { id: 'pg-hostel', label: `PG / Hostel (${pgCount})` },
    { id: 'all', label: `All (${PROPERTIES.length})` },
  ] as const;

  const pageTitle =
    activeTab === 'buy'
      ? 'Buy Properties (Plots, Villas & Houses)'
      : activeTab === 'rent'
      ? 'Rental Properties in Coimbatore'
      : activeTab === 'pg-hostel'
      ? 'PG & Hostel Accommodations'
      : 'All Curated Properties';

  const pageSubtitle =
    activeTab === 'buy'
      ? 'Explore DTCP & RERA approved plot layouts, individual villas, and commercial land available for purchase.'
      : activeTab === 'rent'
      ? 'Browse verified residential flats, houses, and commercial office spaces available for rent.'
      : activeTab === 'pg-hostel'
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

      {/* Controls Bar: Search & Category Tabs */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#A5A5A5]" />
          <input
            type="text"
            placeholder="Search by title, area, location (e.g. Saravanampatti)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(18);
            }}
            className="w-full bg-white pl-10 pr-4 py-2.5 text-[13px] border border-black/10 text-[#141414] focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setVisibleCount(18);
                window.location.hash = `#${tab.id}`;
              }}
              className={`px-4 py-2 text-[12px] font-medium transition-all duration-300 border ${
                activeTab === tab.id
                  ? 'bg-[#141414] text-white border-[#141414]'
                  : 'bg-white text-[#141414] border-black/10 hover:border-black/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Bar */}
      {(stateFilter || districtFilter || (cityFilter && cityFilter !== 'Select City') || (propertyTypeFilter && propertyTypeFilter !== 'Select Property Type') || (budgetFilter && budgetFilter !== 'Select Budget')) && (
        <div className="mb-6 flex flex-wrap items-center gap-2 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl select-none shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Search Filters:</span>
          {stateFilter && (
            <span className="bg-white border border-zinc-200 text-[#141414] px-3.5 py-1.5 text-xs rounded-xl font-bold shadow-sm">
              State: {stateFilter}
            </span>
          )}
          {districtFilter && (
            <span className="bg-white border border-zinc-200 text-[#141414] px-3.5 py-1.5 text-xs rounded-xl font-bold shadow-sm">
              District: {districtFilter}
            </span>
          )}
          {cityFilter && cityFilter !== 'Select City' && (
            <span className="bg-white border border-zinc-200 text-[#141414] px-3.5 py-1.5 text-xs rounded-xl font-bold shadow-sm">
              Area: {cityFilter}
            </span>
          )}
          {propertyTypeFilter && propertyTypeFilter !== 'Select Property Type' && (
            <span className="bg-white border border-zinc-200 text-[#141414] px-3.5 py-1.5 text-xs rounded-xl font-bold shadow-sm">
              Type: {propertyTypeFilter}
            </span>
          )}
          {budgetFilter && budgetFilter !== 'Select Budget' && (
            <span className="bg-white border border-zinc-200 text-[#141414] px-3.5 py-1.5 text-xs rounded-xl font-bold shadow-sm">
              Budget: {budgetFilter}
            </span>
          )}
          <button
            onClick={() => {
              setStateFilter('');
              setDistrictFilter('');
              setCityFilter('');
              setPropertyTypeFilter('');
              setBudgetFilter('');
              sessionStorage.removeItem('raarya_search_filters');
            }}
            className="ml-auto text-xs font-bold text-rose-500 hover:text-rose-700 underline cursor-pointer"
          >
            Clear Search Filters
          </button>
        </div>
      )}

      {/* Properties Count Header */}
      <div className="mb-6 flex items-center justify-between border-b border-black/5 pb-4">
        <p className="text-[13px] text-[#A5A5A5]">
          Showing <span className="font-semibold text-[#141414]">{Math.min(visibleCount, filtered.length)}</span> of{' '}
          <span className="font-semibold text-[#141414]">{filtered.length}</span> properties
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, visibleCount).map((property, i) => (
          <motion.div
            key={property.id || `${property.title}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 6) * 0.05, duration: 0.4 }}
          >
            <PropertyCard
              property={property}
              onClick={() => setSelectedProperty(property)}
            />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center bg-white border border-black/5 p-10">
          <p className="text-[15px] font-medium text-[#141414]">No properties match your filter.</p>
          <p className="text-[13px] text-[#A5A5A5] mt-1">Try clearing search keywords or selecting another category.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveTab('all');
            }}
            className="mt-4 px-5 py-2 text-[12px] font-semibold bg-[#141414] text-white rounded-md"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filtered.length && (
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 18)}
            className="px-8 py-3.5 bg-[#141414] text-white text-[13px] font-medium tracking-wide transition-all duration-300 hover:bg-black/80 shadow-md"
          >
            Load More Properties ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </PageShell>
  );
}
