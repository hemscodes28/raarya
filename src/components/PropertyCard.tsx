import { Bath, Bed, Layers, Square } from 'lucide-react';
import type { PropertyListing } from '../constants';

export function PropertyCard({ property }: { property: PropertyListing }) {
  const stats = [
    property.area > 0 && { icon: Square, label: `${property.area} sq.ft` },
    property.floors > 0 && { icon: Layers, label: `${property.floors} floor${property.floors > 1 ? 's' : ''}` },
    property.beds > 0 && { icon: Bed, label: `${property.beds} bed${property.beds > 1 ? 's' : ''}` },
    property.baths > 0 && { icon: Bath, label: `${property.baths} bath${property.baths > 1 ? 's' : ''}` },
  ].filter(Boolean) as { icon: any; label: string }[];

  return (
    <article className="group bg-white">
      <div className="aspect-[4/3] overflow-hidden md:aspect-square">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-medium tracking-tight text-[#141414]" data-editable>
            {property.title}
          </h3>
          <p className="shrink-0 text-[15px] font-medium text-[#141414]" data-editable>
            {property.price}
          </p>
        </div>
        <p className="text-[12px] text-[#A5A5A5]" data-editable>
          {property.location}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {stats.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px] font-medium text-[#141414]">
              <Icon className="size-[13px] text-[#A5A5A5]" strokeWidth={2.5} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
