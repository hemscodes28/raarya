import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';
import { BlogDetailModal, type BlogPost } from './BlogDetailModal';
import blogDataRaw from '../data/blogs_data.json';
import { getImageUrl } from '../utils/imageHelper';

const BLOG_POSTS = (blogDataRaw as BlogPost[]).slice(0, 3);

export function BlogSection() {
  return (
    <section className="relative px-5 py-20 md:px-10 md:py-28 bg-transparent border-t border-black/5">
      <div id="blog" className="absolute -top-24" />
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-xl">
          <div className="mb-3">
            <span className="inline-block px-3.5 py-1 text-[10.5px] font-mono font-bold uppercase tracking-[0.18em] bg-[#FDF6EA] text-[#B87A28] border border-amber-200/60 rounded-full shadow-xs">
              LATEST INSIGHTS
            </span>
          </div>
          <h2 className="font-heading-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-snug">
            Insights & Guides
          </h2>
          <p className="mt-2.5 text-[14px] text-neutral-500 font-sans font-normal leading-relaxed">
            Stay updated with the latest real estate guidelines, market analysis, and legal check-lists in Coimbatore.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {BLOG_POSTS.map((post, i) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              onClick={() => window.location.hash = 'blog-view/' + post.slug}
              className="group bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden bg-neutral-900 relative">
                  <img 
                    src={getImageUrl(post.image)} 
                    alt={post.title} 
                    className="h-full w-full object-fill transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 text-[9px] font-bold uppercase tracking-wider bg-white/95 text-neutral-900 rounded-full shadow-xs border border-neutral-100">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-[16px] font-bold text-neutral-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-[13px] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-neutral-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-[10.5px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> {post.date}
                  </span>
                </div>
                <span className="group-hover:translate-x-1 transition-transform text-amber-500 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                  Read <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
export default BlogSection;
