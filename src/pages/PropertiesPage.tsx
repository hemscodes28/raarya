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

  useEffect(() => {
    setActiveTab(initialTab);
    setVisibleCount(18);
  }, [initialTab]);

  const filtered = useMemo(() => {
    return PROPERTIES.filter((p) => {
      const matchesTab = activeTab === 'all' || p.type === activeTab;
      const matchesSearch =
        searchTerm === '' ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.subType && p.subType.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchTerm]);

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
