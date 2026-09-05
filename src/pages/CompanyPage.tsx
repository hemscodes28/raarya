import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Users,
  Target,
  Eye,
  ChevronDown,
  PhoneCall,
  MapPin,
  Leaf,
  Home,
  HeartHandshake
} from 'lucide-react';
import { EnquiryModal } from '../components/EnquiryModal';
import DotField from '../components/DotField';

export function CompanyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const benefits = [
    {
      icon: Home,
      title: 'Premium Living',
      tagline: 'Luxury-designed homes & plots',
      desc: 'Meticulously planned layouts built with modern architecture and aesthetic elegance.'
    },
    {
      icon: ShieldCheck,
      title: 'Trusted Quality',
      tagline: 'Reliable construction & clear titles',
      desc: '100% legally verified DTCP & RERA approved projects ensuring complete peace of mind.'
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      tagline: 'High-appreciation corridors',
      desc: 'Strategic positioning across Coimbatore’s fastest-growing IT and residential hubs.'
    },
    {
      icon: HeartHandshake,
      title: 'Customer Support',
      tagline: 'Dedicated end-to-end assistance',
      desc: 'Personalized guidance from initial site visit to registration and post-handover care.'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly Design',
      tagline: 'Green & sustainable spaces',
      desc: 'Thoughtfully planned green environments designed for healthy, modern community living.'
    },
    {
      icon: Users,
      title: 'Professional Team',
      tagline: 'Proven real estate expertise',
      desc: 'Experienced industry advisors delivering transparent, client-first real estate solutions.'
    }
  ];

  const faqs = [
    {
      question: 'Why should I choose Raarya Properties?',
      answer:
        'Raarya Properties offers premium-quality homes built with modern design, trusted construction, and customer-first service. We focus on delivering long-lasting value, prime locations, and lifestyle-enhancing amenities. Contact us for available DTCP plots in Coimbatore – +91 90872 40400.'
    },
    {
      question: 'How do I start the home-buying process?',
      answer:
        'Simply contact our sales team or visit our project site. We will guide you through the property selection, site visit, documentation, and booking process to make your experience smooth and hassle-free.'
    },
    {
      question: 'Are Raarya Properties projects legally approved?',
      answer:
        'Yes, all our projects undergo thorough legal verification and carry the required approvals (DTCP & RERA) from local authorities. We ensure complete transparency and provide clear documentation to our customers.'
    },
    {
      question: 'Do you provide customer support after the purchase?',
      answer:
        'Absolutely. Our dedicated customer support team assists you even after handover, ensuring a smooth moving-in experience and addressing any queries related to maintenance or documentation.'
    },
    {
      question: 'Can I customize my home before handover?',
      answer:
        'Yes, depending on the construction stage, we allow certain customizations such as interior layout adjustments, tile options, and color selections. Our expert team will guide you on all available choices.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#F8F8F8] bg-blueprint-pattern text-[#141414] font-outfit overflow-hidden">
      {/* Optimized Lightweight Background DotField - Ultra smooth 60fps performance without buffering */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <DotField
          dotRadius={1.8}
          dotSpacing={30}
          cursorRadius={100}
          cursorForce={0.15}
          bulgeOnly={true}
          bulgeStrength={25}
          glowRadius={90}
          sparkle={false}
          waveAmplitude={0}
          gradientFrom="rgba(212, 175, 55, 0.35)"
          gradientTo="rgba(180, 140, 50, 0.2)"
          glowColor="rgba(212, 175, 55, 0.08)"
        />
      </div>

      {/* Light gradient overlays to blend top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#F8F8F8] via-[#F8F8F8]/80 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8F8F8]/20 to-[#F8F8F8] pointer-events-none z-10" />

      {/* ─── 1. HERO HEADER SECTION (Compact spacing to eliminate gap) ─── */}
      <section className="relative pt-24 pb-8 md:pt-32 md:pb-10 px-4 sm:px-6 lg:px-8 border-b border-black/5 overflow-hidden z-20">
        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-mono font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm"
          >
            <span>Coimbatore’s Trusted Real Estate Partner Since 2022</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#141414] font-heading-display leading-tight"
          >
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600">Raarya Property Promoters</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-3xl mx-auto text-base sm:text-lg text-zinc-700 leading-relaxed font-light"
          >
            Transforming Coimbatore’s property landscape with modern architecture, sustainable developments, and customer-first integrity.
          </motion.p>
        </div>
      </section>

      {/* ─── 2. WELCOME & DETAILED OVERVIEW SECTION (Slightly reduced top gap) ─── */}
      <section className="pt-8 pb-16 md:pt-10 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Visual Showcase Card with Continuous Gentle Float & Rotating Gold Aura Ring */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative pb-8"
          >
            {/* Animated Rotating Gold Aura Ring */}
            <motion.div
              animate={{ rotate: [0, 360], scale: [0.98, 1.03, 0.98] }}
              transition={{ rotate: { repeat: Infinity, duration: 18, ease: 'linear' }, scale: { repeat: Infinity, duration: 5, ease: 'easeInOut' } }}
              className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-r from-amber-500/35 via-yellow-400/25 to-amber-600/35 blur-xl opacity-80 pointer-events-none"
            />

            {/* Floating Card Container */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="relative rounded-3xl bg-white border border-amber-500/30 shadow-2xl p-3.5 group transition-all duration-500 hover:shadow-[0_25px_60px_rgba(212,175,55,0.3)] hover:border-amber-500"
            >
              
              {/* Image Container with Soft Sheen Overlay */}
              <div className="relative rounded-2xl overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
                  alt="Raarya Property Architecture"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Sheen animation over image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Floating Stat Badges - Fully visible with proper bottom margin & padding */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-3.5 p-4 sm:p-5 rounded-2xl bg-white/98 border border-amber-500/40 shadow-xl flex items-center justify-between gap-2 sm:gap-4 relative z-30"
              >
                <div className="text-center flex-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-600 block font-mono">2022</span>
                  <span className="text-[11px] sm:text-xs uppercase font-extrabold text-zinc-600 tracking-wider block mt-0.5">Established</span>
                </div>
                <div className="h-9 w-px bg-zinc-200" />
                <div className="text-center flex-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 block font-mono">650+</span>
                  <span className="text-[11px] sm:text-xs uppercase font-extrabold text-zinc-600 tracking-wider block mt-0.5">Listings</span>
                </div>
                <div className="h-9 w-px bg-zinc-200" />
                <div className="text-center flex-1">
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 block font-mono">100%</span>
                  <span className="text-[11px] sm:text-xs uppercase font-extrabold text-zinc-600 tracking-wider block mt-0.5">Approved</span>
                </div>
              </motion.div>

            </motion.div>
          </motion.div>

          {/* Right Column: Detailed Official Text */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-5"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 block">
                WELCOME TO
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141414] tracking-tight">
                Raarya Property Promoters
              </h2>
            </div>

            <div className="space-y-3.5 text-zinc-700 text-[15px] sm:text-[15.5px] leading-relaxed font-normal">
              <p className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-black/5 shadow-sm hover:border-amber-500/40 transition-colors">
                <strong className="text-amber-700 font-semibold">Raarya Property Promoters</strong> has been Coimbatore’s trusted real estate partner since 2022, dedicated to transforming the city’s property landscape with innovation and sustainability. We specialize in creating living and working spaces that blend modern design, environmental responsibility, and lasting value. Guided by our core principles of integrity, quality, and customer satisfaction, Raarya Property Promoters strives to deliver excellence in every project.
              </p>

              <p className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-black/5 shadow-sm hover:border-amber-500/40 transition-colors">
                Our services cover a wide range of real estate solutions, including residential and commercial developments, property management, and investment consultation. Whether you are looking for affordable homes, luxury villas, or strategically located commercial spaces, Raarya Property Promoters ensures that every project is meticulously planned for maximum comfort, convenience, and productivity.
              </p>

              <p className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-black/5 shadow-sm hover:border-amber-500/40 transition-colors">
                We take pride in our commitment to superior construction quality and timely delivery, ensuring that each customer’s dream is realized with precision and care. With a focus on sustainable development, innovation, and transparency, Raarya Property Promoters continues to redefine Coimbatore’s real estate standards. Thank you for choosing us as your trusted real estate partner — together, we are building a brighter and more sustainable future for Coimbatore.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─── 3. OUR BENEFITS (WHY CHOOSE RAARYA) ─── */}
      <section className="py-14 md:py-20 bg-white/50 border-y border-black/5 relative z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 block">
              OUR BENEFITS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141414] tracking-tight">
              Why Choose Raarya
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base">
              Discover why homebuyers and real estate investors across Coimbatore trust Raarya Property Promoters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="group relative overflow-hidden p-6 rounded-3xl bg-white/95 border border-black/5 hover:border-amber-500/60 shadow-sm hover:shadow-[0_12px_30px_rgba(212,175,55,0.15)] transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Glowing top line */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 w-fit group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <b.icon className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#141414] group-hover:text-amber-700 transition-colors">
                      {b.title}
                    </h3>
                    <span className="text-xs font-mono text-amber-600 font-semibold block mt-0.5">
                      {b.tagline}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                    {b.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 4. MISSION & VISION CARDS ─── */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-50/50 border border-amber-500/30 shadow-lg space-y-4 hover:border-amber-500 transition-all"
          >
            <div className="p-4 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/30 w-fit">
              <Target className="size-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#141414] tracking-tight">Our Mission</h3>
            <p className="text-zinc-700 text-base leading-relaxed font-light">
              To create premium living spaces that combine modern architecture, long-lasting quality, and lifestyle comfort — ensuring every family experiences a better way of living.
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-blue-500/10 via-white to-blue-50/50 border border-blue-500/30 shadow-lg space-y-4 hover:border-blue-500 transition-all"
          >
            <div className="p-4 rounded-2xl bg-blue-500/15 text-blue-600 border border-blue-500/30 w-fit">
              <Eye className="size-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#141414] tracking-tight">Our Vision</h3>
            <p className="text-zinc-700 text-base leading-relaxed font-light">
              To become a trusted real estate brand known for innovation, transparency, and customer-first approach — shaping communities where people love to live, work, and grow.
            </p>
          </motion.div>

        </div>
      </section>

      {/* ─── 5. READY TO FIND YOUR DREAM HOME CTA ─── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-20">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-14 bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-amber-100 text-base font-light">
              Connect with Raarya Properties today and take the next step toward modern, premium living in Coimbatore.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full md:w-auto">
            <a
              href="tel:+919087240400"
              className="px-6 py-3.5 bg-white hover:bg-amber-50 text-slate-950 font-bold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <PhoneCall className="size-4 text-amber-600" />
              <span>Call +91 90872 40400</span>
            </a>

            <button
              type="button"
              onClick={() => setShowEnquiryModal(true)}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Enquire Online</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 6. FREQUENTLY ASKED QUESTIONS (FAQS ACCORDION) ─── */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-20">
        <div className="space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 block">
              FAQS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141414] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/95 border border-black/5 hover:border-amber-500/40 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-bold text-[#141414] leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`size-5 text-amber-600 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-5 sm:p-6 pt-0 text-sm sm:text-base text-zinc-600 leading-relaxed font-light border-t border-black/5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        propertyName="General Enquiry"
        propertyPrice="About Raarya Properties"
        propertyLocation="Coimbatore"
      />
    </div>
  );
}
