import { Bath, Bed, Layers, Square, Eye, MapPin, Sparkles } from 'lucide-react';
import type { PropertyListing } from '../constants';

interface PropertyCardProps {
  property: PropertyListing;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const areaLabel = property.areaDisplay || (
    property.areaUnit === 'cent' ? `${property.area} Cents` :
    property.areaUnit === 'acre' ? `${property.area} Acres` :
    property.areaUnit === 'bhk' ? `${property.beds || 2} BHK` :
    property.area > 0 ? `${property.area} sq.ft` : null
  );

  const propType = property.overviewDetails?.['Property Type'] || property.subType || 'Residential';

  const stats = [
    areaLabel && { icon: Square, label: areaLabel },
    property.floors > 0 && { icon: Layers, label: `${property.floors} floor${property.floors > 1 ? 's' : ''}` },
    property.beds > 0 && { icon: Bed, label: `${property.beds} BHK` },
    property.baths > 0 && { icon: Bath, label: `${property.baths} Bath${property.baths > 1 ? 's' : ''}` },
  ].filter(Boolean) as { icon: any; label: string }[];

  return (
    <article
      onClick={onClick}
      className="group relative bg-white border border-neutral-200/90 hover:border-amber-500/40 rounded-[24px] shadow-sm hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] -translate-y-0 hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* IMAGE HERO CONTAINER WITH BLENDED CORNERS */}
        <div className="relative aspect-[4/3] md:aspect-square overflow-hidden bg-neutral-900">
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

          {/* RE-FRAMED LUXURY TOP BADGES */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-black/85 text-amber-400 backdrop-blur-md rounded-full border border-amber-500/30 shadow-md flex items-center gap-1">
                <Sparkles className="size-2.5 text-amber-400" />
                {property.type === 'buy' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : 'PG / Hostel'}
              </span>

              <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 text-neutral-900 backdrop-blur-md rounded-full border border-black/10 shadow-md">
                {propType}
              </span>
            </div>
          </div>

          {/* QUICK OVERVIEW HOVER BADGE */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-extrabold text-[12.5px] rounded-full shadow-2xl transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 border border-white/40">
              <Eye className="size-4 text-amber-500" /> Quick Overview
            </span>
          </div>
        </div>

        {/* CARD BODY CONTENT */}
        <div className="space-y-3.5 p-5 md:p-6 bg-white">
          <div className="flex items-start justify-between gap-3">
            {/* Title with sleek typography */}
            <h3 className="text-[15.5px] font-bold tracking-tight text-neutral-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
              {property.title}
            </h3>

            {/* INNOVATIVE HIGHLIGHTED PRICE BOX WITH SHIMMER ANIMATION */}
            <div className="relative shrink-0 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-neutral-900 via-black to-neutral-900 text-amber-400 font-black text-[13.5px] tracking-tight border border-amber-500/30 shadow-md overflow-hidden group-hover:border-amber-400 transition-colors">
              {/* Shimmer overlay animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <span className="relative z-10">{property.price}</span>
            </div>
          </div>

          {/* Location with Pin */}
          <div className="flex items-center gap-1.5 text-[12.5px] text-neutral-500 font-medium">
            <MapPin className="size-3.5 text-amber-500 shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          {/* DYNAMIC SPECS BAR */}
          {stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-neutral-100">
              {stats.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-neutral-700 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-100">
                  <Icon className="size-[13px] text-amber-500" strokeWidth={2.5} />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
