import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
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
    <section className="relative py-24 md:py-32 bg-transparent border-t border-black/5 overflow-hidden">
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
                <div className="mb-3">
                  <span className="inline-block px-3.5 py-1 text-[10.5px] font-mono font-bold uppercase tracking-[0.18em] bg-[#FDF6EA] text-[#B87A28] border border-amber-200/60 rounded-full shadow-xs">
                    HANDPICKED PREMIUM LISTINGS
                  </span>
                </div>
                <h2 className="font-heading-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                  Recommended for You
                </h2>
                <p className="mt-2.5 text-[14px] text-neutral-500 font-sans font-normal leading-relaxed">
                  Top-tier investment layout plots with verified titles and premium infrastructure.
                </p>
              </div>
              <div>
                <a
                  href="#buy"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-900 border border-neutral-200 hover:border-neutral-900 text-neutral-900 hover:text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-sm hover:shadow transition-all duration-300 ease-out cursor-pointer"
                >
                  <span>EXPLORE BUY CATALOG</span>
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
                  className="h-full flex flex-col"
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
                <div className="mb-3">
                  <span className="inline-block px-3.5 py-1 text-[10.5px] font-mono font-bold uppercase tracking-[0.18em] bg-[#FDF6EA] text-[#B87A28] border border-amber-200/60 rounded-full shadow-xs">
                    HIGH GROWTH POTENTIALS
                  </span>
                </div>
                <h2 className="font-heading-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                  Demanded Projects
                </h2>
                <p className="mt-2.5 text-[14px] text-neutral-500 font-sans font-normal leading-relaxed">
                  Highly sought-after layout plots located within prime developmental corridors.
                </p>
              </div>
              <div>
                <a
                  href="#buy"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-900 border border-neutral-200 hover:border-neutral-900 text-neutral-900 hover:text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-sm hover:shadow transition-all duration-300 ease-out cursor-pointer"
                >
                  <span>EXPLORE DEMANDED LAYOUTS</span>
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
                  className="h-full flex flex-col"
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
                <div className="mb-3">
                  <span className="inline-block px-3.5 py-1 text-[10.5px] font-mono font-bold uppercase tracking-[0.18em] bg-[#FDF6EA] text-[#B87A28] border border-amber-200/60 rounded-full shadow-xs">
                    LATEST ADDITIONS
                  </span>
                </div>
                <h2 className="font-heading-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                  New Properties
                </h2>
                <p className="mt-2.5 text-[14px] text-neutral-500 font-sans font-normal leading-relaxed">
                  Freshly listed plots uploaded directly by owners and verified agents.
                </p>
              </div>
              <div>
                <a
                  href="#buy"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-900 border border-neutral-200 hover:border-neutral-900 text-neutral-900 hover:text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-sm hover:shadow transition-all duration-300 ease-out cursor-pointer"
                >
                  <span>EXPLORE NEW ARRIVALS</span>
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
                  className="h-full flex flex-col"
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
