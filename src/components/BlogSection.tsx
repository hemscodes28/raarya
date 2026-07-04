import { motion } from 'motion/react';

const BLOG_POSTS = [
  {
    title: "Why Saravanampatti is Coimbatore's Hottest Real Estate Destination",
    excerpt: "With the rapid expansion of IT parks and educational institutions, Saravanampatti has become a goldmine for residential plot investors.",
    date: "July 2, 2026",
    category: "Market Trends",
    image: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145701_de344c15-5eac-4c64-8bd6-19a2811bba4a.png&w=1280&q=85",
  },
  {
    title: "Legal Checklist: Purchasing Villa Plots in Tamil Nadu",
    excerpt: "Important documentation checks you must perform, including DTCP/RERA approvals, parent documents, and encumbrance certificates.",
    date: "June 28, 2026",
    category: "Buyers Guide",
    image: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_145923_c1a9880c-0fab-4a76-8289-bd650d5e5dce.png&w=1280&q=85",
  },
  {
    title: "5 Modern Villa Construction Trends for 2026",
    excerpt: "Explore the latest design and construction trends, from sustainable green building techniques to modern smart home automations.",
    date: "June 15, 2026",
    category: "Construction",
    image: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260503_150022_cdda0eaa-1c17-4f59-8188-4f98b328619f.png&w=1280&q=85",
  }
];

export function BlogSection() {
  return (
    <section className="relative px-5 py-20 md:px-10 md:py-28 bg-[#F8F8F8] border-t border-black/5">
      <div id="blog" className="absolute -top-24" />
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-14">
          <h2 className="text-3xl font-medium leading-[1.1] tracking-tight text-[#141414] md:text-5xl" data-editable>
            Insights & Trends
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#A5A5A5] max-w-xl" data-editable>
            Stay updated with the latest real estate guidelines, market analysis, and construction insights in Coimbatore.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {BLOG_POSTS.map((post, i) => (
            <motion.article 
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="group bg-white border border-black/5 flex flex-col h-full"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-[11px] font-semibold text-[#A5A5A5] mb-3">
                  <span className="text-[#141414] uppercase tracking-wider">{post.category}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="text-[18px] font-medium leading-snug text-[#141414] group-hover:opacity-75 transition-opacity mb-3">
                  {post.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#A5A5A5] mb-6 flex-1">
                  {post.excerpt}
                </p>
                <button 
                  type="button" 
                  className="text-[12px] font-semibold uppercase tracking-wider text-[#141414] hover:opacity-60 transition-opacity self-start"
                >
                  Read Article →
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
