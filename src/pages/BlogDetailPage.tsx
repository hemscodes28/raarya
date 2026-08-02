import { Calendar, User, Clock, ArrowLeft, Send } from 'lucide-react';
import blogDataRaw from '../data/blogs_data.json';
import { type BlogPost } from '../components/BlogDetailModal';
import { getImageUrl } from '../utils/imageHelper';

interface BlogDetailPageProps {
  slug: string;
}

export function BlogDetailPage({ slug }: BlogDetailPageProps) {
  const post = (blogDataRaw as BlogPost[]).find((b) => b.slug === slug);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-neutral-900">Article not found</h2>
        <p className="text-xs text-neutral-400 mt-1">The requested article could not be located.</p>
        <a
          href="#blog"
          className="mt-6 px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl"
        >
          Back to Blog
        </a>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi Rajkumar! I am reading your article: "${post.title}". I am interested in properties in Coimbatore. Please share details.`
  );

  return (
    <article className="min-h-screen pb-24 pt-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back navigation link */}
      <div className="mb-8">
        <a
          href="#blog"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </a>
      </div>

      {/* Full-Width Poster Top Image — full image, no crop */}
      <div className="w-full mb-10">
        <img
          src={getImageUrl(post.image)}
          alt={post.title}
          className="w-full h-auto"
        />
      </div>

      {/* Title & Metadata Section */}
      <div className="space-y-4 border-b border-neutral-200/80 pb-6 mb-8">
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

      {/* Article Content - rendered with beautiful premium Lora font */}
      <div className="space-y-6 text-[16px] sm:text-[18px] leading-relaxed text-neutral-800 font-serif font-lora">
        {post.contentBlocks.map((block, idx) => {
          // If block text includes menu navigation links or unrelated items, skip
          const NAV_ITEMS = new Set([
            'Properties', 'Post Property', 'Blog', 'Home Loan', 'Contact Us',
            'PG / Hostel', 'PG/Hostel', 'About Us', 'Careers', 'Career',
            'EMI Calculator', 'Eligibility Check', 'Buy', 'Rent',
            'Login', 'Sign Up', 'Register', 'Company', 'About',
          ]);
          if (NAV_ITEMS.has(block.text?.trim())) {
            return null;
          }

          if (block.tag === 'h2') {
            return (
              <h2
                key={idx}
                className="font-heading-display text-xl sm:text-2xl font-bold text-neutral-900 pt-6 pb-2 border-b border-neutral-100/80 font-sans"
              >
                {block.text}
              </h2>
            );
          }
          if (block.tag === 'h3') {
            return (
              <h3 key={idx} className="font-sans text-lg font-bold text-neutral-900 pt-4">
                {block.text}
              </h3>
            );
          }
          if (block.tag === 'li') {
            return (
              <ul key={idx} className="list-disc pl-6 space-y-2 my-2 font-serif font-lora">
                <li className="text-neutral-800">{block.text}</li>
              </ul>
            );
          }
          return (
            <p key={idx} className="text-neutral-800 font-serif font-lora">
              {block.text}
            </p>
          );
        })}
      </div>

      {/* Speak with Rajkumar CTA Footer section */}
      <div className="mt-12 pt-8 border-t border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
    </article>
  );
}
export default BlogDetailPage;
