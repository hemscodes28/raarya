import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { PROPERTIES, type PropertyListing } from '../constants';
import { PropertyCard } from './PropertyCard';
import { PropertyDetailModal } from './PropertyDetailModal';

export function ShowcaseSection() {
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

  // Filter listings dynamically from database using flags
  const recommended = PROPERTIES.filter((p) => (p as any).isRecommended);
  const demanded = PROPERTIES.filter((p) => (p as any).isDemanded);
  const newListings = PROPERTIES.filter((p) => (p as any).isNew);

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-[#F8F8F6] via-white to-[#F5F5F3] border-t border-black/5 overflow-hidden">
      {/* Background elegant accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedProperty && (
          <PropertyDetailModal
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ─── RECOMMENDED FOR YOU SECTION ─── */}
        {recommended.length > 0 && (
          <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Sparkles className="size-4 text-amber-600" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Handpicked Premium Listings</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl leading-tight">
                  Recommended for You
                </h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-500 font-serif italic tracking-wide">
                  Top-tier investment layout plots with verified titles and premium infrastructure.
                </p>
              </div>
              <div>
                <a
                  href="#buy"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-900 border border-neutral-200 hover:border-neutral-900 text-neutral-800 hover:text-white text-[12px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all duration-300 ease-out cursor-pointer"
                >
                  <span>Explore Buy Catalog</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recommended.map((property, i) => (
                <motion.div
                  key={property.id || `rec-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.55, ease: 'easeOut' }}
                >
                  <PropertyCard
                    property={property}
                    onClick={() => setSelectedProperty(property)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ─── DEMANDED PROJECTS SECTION ─── */}
        {demanded.length > 0 && (
          <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 bg-amber-500/10 rounded-lg">
                    <TrendingUp className="size-4 text-amber-600" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">High growth potentials</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl leading-tight">
                  Demanded Projects
                </h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-500 font-serif italic tracking-wide">
                  Highly sought-after layout plots located within prime developmental corridors.
                </p>
              </div>
              <div>
                <a
                  href="#buy"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-900 border border-neutral-200 hover:border-neutral-900 text-neutral-800 hover:text-white text-[12px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all duration-300 ease-out cursor-pointer"
                >
                  <span>Explore demanded layouts</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {demanded.map((property, i) => (
                <motion.div
                  key={property.id || `dem-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.55, ease: 'easeOut' }}
                >
                  <PropertyCard
                    property={property}
                    onClick={() => setSelectedProperty(property)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ─── NEW PROPERTIES SECTION ─── */}
        {newListings.length > 0 && (
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Clock className="size-4 text-amber-600" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Latest additions</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl leading-tight">
                  New Properties
                </h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-500 font-serif italic tracking-wide">
                  Freshly listed plots uploaded directly by owners and verified agents.
                </p>
              </div>
              <div>
                <a
                  href="#buy"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-900 border border-neutral-200 hover:border-neutral-900 text-neutral-800 hover:text-white text-[12px] font-extrabold uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all duration-300 ease-out cursor-pointer"
                >
                  <span>Explore new arrivals</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {newListings.map((property, i) => (
                <motion.div
                  key={property.id || `new-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.1, duration: 0.55, ease: 'easeOut' }}
                >
                  <PropertyCard
                    property={property}
                    onClick={() => setSelectedProperty(property)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
