import { motion } from 'motion/react';
import { Building2, Key, Home, ArrowRight } from 'lucide-react';
import { PROPERTIES } from '../constants';

export function CategoryExplorerSection() {
  const buyCount = PROPERTIES.filter((p) => p.type === 'buy').length;
  const rentCount = PROPERTIES.filter((p) => p.type === 'rent').length;
  const pgCount = PROPERTIES.filter((p) => p.type === 'pg-hostel').length;

  const categories = [
    {
      id: 'buy',
      title: 'Buy Properties',
      subtitle: 'Plots, Villas & Houses',
      count: `${buyCount} Active Listings`,
      description: 'DTCP & RERA approved layout plots, independent luxury villas, and commercial land across Coimbatore.',
      icon: Building2,
      image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145701_de344c15-5eac-4c64-8bd6-19a2811bba4a.png&w=1280&q=85',
      route: '#buy',
      cta: 'Explore Buy Catalogue'
    },
    {
      id: 'rent',
      title: 'Rental Properties',
      subtitle: 'Flats, Houses & Office Space',
      count: `${rentCount} Active Listings`,
      description: 'Verified residential apartments, cozy 2BHK/3BHK independent houses, and prime office spaces for rent.',
      icon: Key,
      image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_150112_2b0e700f-7af4-4459-b326-7d9e2f468daa.png&w=1280&q=85',
      route: '#rent',
      cta: 'Explore Rental Catalogue'
    },
    {
      id: 'pg-hostel',
      title: 'PG & Hostels',
      subtitle: 'Mens & Ladies Accommodations',
      count: `${pgCount > 0 ? pgCount : 'Verified'} PG Units`,
      description: 'Executive mens PGs, luxury girls PGs, and student hostels with food, Wi-Fi, and 24/7 security.',
      icon: Home,
      image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145923_c1a9880c-0fab-4a76-8289-bd650d5e5dce.png&w=1280&q=85',
      route: '#pg-hostel',
      cta: 'Explore PG & Hostels'
    }
  ];

  return (
    <section className="relative px-5 py-20 md:px-10 md:py-28 bg-[#F8F8F8] border-t border-black/5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-medium leading-[1.1] tracking-tight text-[#141414] md:text-5xl">
            Explore Property Modules
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#A5A5A5]">
            Click any category below to open a dedicated showcase page with complete search, filtering, and detailed glassmorphism property overviews.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="group relative bg-white border border-black/5 hover:border-black/20 hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-white/90 text-black text-[11px] font-bold uppercase tracking-wider backdrop-blur-md rounded-full shadow">
                      <Icon className="size-3.5 text-amber-600" />
                      {cat.count}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">{cat.subtitle}</span>
                      <h3 className="text-2xl font-bold tracking-tight text-white mt-0.5">{cat.title}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-[13px] leading-relaxed text-[#A5A5A5]">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-black/5">
                  <a
                    href={cat.route}
                    className="inline-flex items-center justify-between w-full px-5 py-3 bg-[#141414] group-hover:bg-black text-white text-[13px] font-semibold transition-all duration-300 rounded-sm"
                  >
                    <span>{cat.cta}</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
