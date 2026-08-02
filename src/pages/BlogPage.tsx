import { useState, useMemo } from 'react';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { type BlogPost } from '../components/BlogDetailModal';
import blogDataRaw from '../data/blogs_data.json';
import { getImageUrl } from '../utils/imageHelper';

const BLOG_POSTS = blogDataRaw as BlogPost[];

export function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <PageShell 
      title="Guides & Insights" 
      subtitle="Comprehensive articles, legal checklists, and real estate market updates for property buyers in Coimbatore."
    >

      {/* Controls Bar: Search */}
      <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search articles, topics or checklists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 text-[13px] border border-black/10 text-neutral-900 focus:outline-none focus:border-black transition-colors rounded-xl"
          />
        </div>
      </div>

      {/* ARTICLE LIST (All in Horizontal Format matching screenshot layout) */}
      <div className="space-y-10">
        {filteredPosts.map((post) => (
          <div 
            key={post.id}
            onClick={() => window.location.hash = 'blog-view/' + post.slug}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer lg:h-[280px]"
          >
            <div className="lg:col-span-5 aspect-[16/10] lg:aspect-auto overflow-hidden bg-neutral-900 h-full">
              <img 
                src={getImageUrl(post.image)} 
                alt={post.title}
                className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div>
                  <span className="inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 rounded-full">
                    {post.category}
                  </span>
                </div>
                <h2 className="font-heading-display text-lg sm:text-xl md:text-2xl font-extrabold text-neutral-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-neutral-600 text-[13px] sm:text-[14px] leading-relaxed line-clamp-2 font-serif">
                  {post.excerpt}
                </p>
              </div>
              
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-500" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500" /> 5 Min Read</span>
                </div>
                <span className="group-hover:translate-x-1.5 transition-transform text-amber-500 flex items-center gap-1 font-bold text-xs uppercase tracking-wider shrink-0">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="py-20 text-center bg-white border border-neutral-100 rounded-3xl p-10">
          <p className="text-[15px] font-medium text-neutral-900">No blog posts found matching your keywords.</p>
          <p className="text-xs text-neutral-400 mt-1">Try searching for other words like "plot", "approval" or "Karamadai".</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 px-5 py-2 text-xs font-semibold bg-[#141414] text-white rounded-xl"
          >
            Clear Search
          </button>
        </div>
      )}
    </PageShell>
  );
}
export default BlogPage;
