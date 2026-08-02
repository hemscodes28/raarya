import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Clock, ArrowLeft, Send } from 'lucide-react';
import { getImageUrl } from '../utils/imageHelper';

export interface BlogBlock {
  tag: string;
  text: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  image: string;
  images?: string[];
  excerpt: string;
  contentBlocks: BlogBlock[];
}

interface BlogDetailModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

export function BlogDetailModal({ post, onClose }: BlogDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (post) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [post, onClose]);

  if (!post) return null;

  const whatsappMessage = encodeURIComponent(
    `Hi Rajkumar! I am reading your article: "${post.title}". I am interested in properties in Coimbatore. Please share details.`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-all duration-300"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-neutral-800 border border-neutral-200/50 rounded-3xl shadow-2xl my-auto scrollbar-thin scrollbar-thumb-neutral-200"
        >
          {/* Back/Close header bar */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Articles
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Hero Banner */}
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-neutral-900">
            <img
              src={getImageUrl(post.image)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black rounded-full shadow-md">
                {post.category}
              </span>
            </div>
          </div>

          {/* Article Container */}
          <div className="p-6 sm:p-10 md:p-12 space-y-8">
            {/* Title & Metadata */}
            <div className="space-y-4 border-b border-neutral-100 pb-6">
              <h1 className="font-heading-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" /> {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" /> {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> 5 Min Read
                </span>
              </div>
            </div>

            {/* Content Rendering */}
            <div className="space-y-6 text-[15px] sm:text-[16px] leading-relaxed text-neutral-700 font-sans">
              {post.contentBlocks.map((block, idx) => {
                // If block text includes menu navigation links or unrelated items, skip
                if (block.text === 'Properties' || block.text === 'Post Property' || block.text === 'Blog' || block.text === 'Home Loan' || block.text === 'Contact Us') {
                  return null;
                }
                
                if (block.tag === 'h2') {
                  return (
                    <h2 key={idx} className="font-heading-display text-xl sm:text-2xl font-bold text-neutral-900 pt-4 pb-2 border-b border-neutral-100">
                      {block.text}
                    </h2>
                  );
                }
                if (block.tag === 'h3') {
                  return (
                    <h3 key={idx} className="font-sans text-lg font-bold text-neutral-900 pt-3">
                      {block.text}
                    </h3>
                  );
                }
                if (block.tag === 'li') {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2">
                      <li className="text-neutral-700">{block.text}</li>
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="text-neutral-700">
                    {block.text}
                  </p>
                );
              })}
            </div>

            {/* Author Footer & Call To Action */}
            <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg select-none shrink-0 border border-amber-500/20">
                  R
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-neutral-900">Written by {post.author}</h4>
                  <p className="text-xs text-neutral-500">Real Estate Expert at Raarya Groups</p>
                </div>
              </div>
              <div>
                <a
                  href={`https://api.whatsapp.com/send?phone=+919087240400&text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#141414] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Speak with Real Estate Advisor
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
