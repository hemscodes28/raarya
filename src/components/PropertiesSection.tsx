import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROPERTIES } from '../constants';
import { PropertyCard } from './PropertyCard';

export function PropertiesSection() {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'pg-hostel'>('buy');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === 'buy' || hash === 'rent' || hash === 'pg-hostel') {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const filteredProperties = PROPERTIES.filter((p) => p.type === activeTab);

  const tabs = [
    { id: 'buy', label: 'Buy (Villas & Plots)' },
    { id: 'rent', label: 'Rentals' },
    { id: 'pg-hostel', label: 'PG / Hostels' },
  ] as const;

  return (
    <section className="relative px-5 py-20 md:px-10 md:py-28 bg-[#F8F8F8] border-t border-black/5">
      {/* Scroll Offset Targets for Fixed Navbar */}
      <div id="buy" className="absolute -top-24" />
      <div id="rent" className="absolute -top-24" />
      <div id="pg-hostel" className="absolute -top-24" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-12 items-end">
          <div className="md:col-span-6">
            <h2
              className="text-3xl font-medium leading-[1.1] tracking-tight text-[#141414] md:text-5xl"
              data-editable
              data-preset-text="properties-headline"
            >
              Explore our premium properties
            </h2>
            <p
              className="mt-4 text-[14px] leading-relaxed text-[#A5A5A5]"
              data-editable
              data-preset-text="properties-subcopy"
            >
              Discover high-quality residential layouts, commercial plots, modern rentals, and student PGs in Coimbatore.
            </p>
          </div>
          
          {/* Interactive Filters */}
          <div className="md:col-span-6 flex flex-wrap justify-start md:justify-end gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  window.history.pushState(null, '', `#${tab.id}`);
                }}
                className={`px-5 py-2.5 text-[13px] font-medium transition-all duration-300 border ${
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

        {/* Animated Properties Grid */}
        <div className="grid gap-8 md:grid-cols-3 min-h-[350px]">
          <AnimatePresence mode="wait">
            {filteredProperties.map((property, i) => (
              <motion.div
                key={property.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredProperties.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[#A5A5A5]">No listings found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
