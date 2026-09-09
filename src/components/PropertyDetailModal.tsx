import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Square,
  Bed,
  Bath,
  Layers,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Building,
  UserCheck,
  CheckCircle,
  Clock,
  Tag
} from 'lucide-react';
import type { PropertyListing } from '../constants';
import { getImageUrl } from '../utils/imageHelper';
import { EnquiryModal } from './EnquiryModal';

interface PropertyDetailModalProps {
  property: PropertyListing | null;
  onClose: () => void;
}

export function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showFullEnquiryModal, setShowFullEnquiryModal] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setDirection(1);
    setShowEnquiryForm(false);
    setFormSubmitted(false);
  }, [property]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (property) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [property, onClose]);

  if (!property) return null;

  const galleryImages = property.images && property.images.length > 0
    ? property.images
    : [property.image];

  const primaryPhone = property.agentPhone ||
    (property.agentPhones && property.agentPhones.length > 0 ? property.agentPhones[0] : '9787255522');

  const listerName = property.agentName && property.agentName !== 'Raarya Property Representative'
    ? property.agentName
    : 'Rajkumar';

  const whatsappMessage = encodeURIComponent(
    `Hi ${listerName}! I am interested in your property listing: "${property.title}" (${property.price}) at ${property.location}. Please share complete details.`
  );

  const prevImage = () => {
    setDirection(-1);
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setDirection(1);
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleSelectImage = (idx: number) => {
    setDirection(idx > activeImageIndex ? 1 : -1);
    setActiveImageIndex(idx);
  };

  // Gallery 3D Aperture Slide Transition Variants (Hardware Accelerated)
  const galleryVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      scale: 0.96,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: '0%',
      scale: 1,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? '100%' : '-100%',
      scale: 1.04,
      opacity: 0,
    }),
  };

  // Point-by-point description lines
  const descPoints = property.descriptionPoints && property.descriptionPoints.length > 0
    ? property.descriptionPoints
    : (property.description ? property.description.split(/(?<=\.)\s+/).filter(s => s.trim().length > 10) : []);

  // Dynamic Area / Extent Display
  const ovDetails = property.overviewDetails || {};
  const rawArea = ovDetails.Area || property.areaDisplay || (property.area ? `${property.area} sq.ft` : '');
  const propType = ovDetails['Property Type'] || property.subType || 'Residential';
  const propStatus = ovDetails.Status || 'Ready for Sale';
  const propFurnishing = ovDetails.Furnishing || 'Unfurnished';
  const propListedFor = ovDetails['Listed For'] || (property.type === 'buy' ? 'Sell' : property.type === 'rent' ? 'Rent' : 'PG Accommodation');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto">
        {/* Dark Backdrop (Fast GPU Render) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 sm:backdrop-blur-xl transition-opacity duration-200"
        />

        {/* Main Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#0d0d10] text-white border border-white/15 rounded-3xl shadow-2xl sm:backdrop-blur-2xl scrollbar-thin scrollbar-thumb-white/20 my-auto transform-gpu"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-30 flex size-10 items-center justify-center rounded-full bg-black/75 text-white/90 hover:bg-black hover:text-white border border-amber-400/40 backdrop-blur-md transition-all shadow-lg cursor-pointer hover:scale-105"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>

          {/* GALLERY HERO SECTION WITH LUXURY CREAM / CHAMPAGNE BLENDED BORDER */}
          <div className="relative p-3 sm:p-5 md:p-6 bg-gradient-to-b from-[#09090c] via-[#0e0e12] to-[#0a0a0d] border-b border-white/10">
            {/* Luxury Outer Frame with Cream / Ivory Champagne Border & Glowing Blended Corners */}
            <div className="relative group/showcase rounded-2xl md:rounded-3xl p-1.5 sm:p-2 bg-[#121218] border-2 border-[#e8d5b7]/70 hover:border-[#f5ebe0] shadow-[0_0_35px_rgba(232,213,183,0.28)] hover:shadow-[0_0_55px_rgba(245,235,224,0.45)] transition-all duration-500 overflow-hidden">
              
              {/* 4 Blended Corner Radial Light Glows */}
              <div className="absolute top-0 left-0 size-28 corner-glow-tl pointer-events-none z-10" />
              <div className="absolute top-0 right-0 size-28 corner-glow-tr pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 size-28 corner-glow-bl pointer-events-none z-10" />
              <div className="absolute bottom-0 right-0 size-28 corner-glow-br pointer-events-none z-10" />

              {/* Inner Image Viewer Box */}
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-xl md:rounded-2xl overflow-hidden bg-black shadow-2xl">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.img
                    key={galleryImages[activeImageIndex]}
                    src={getImageUrl(galleryImages[activeImageIndex])}
                    alt={property.title}
                    custom={direction}
                    variants={galleryVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 280, damping: 30 },
                      opacity: { duration: 0.35 },
                      scale: { duration: 0.35 },
                    }}
                    className="absolute inset-0 h-full w-full object-cover group-hover/showcase:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                </AnimatePresence>

                {/* Cream Shimmer Light Beam Swipe across frame on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f5ebe0]/25 to-transparent -translate-x-full group-hover/showcase:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

                {/* Subtle vignette for badge legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none z-10" />

                {/* Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                  <span className="px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-[#e8d5b7] text-[#141414] rounded-full shadow-lg border border-[#f5ebe0]/60">
                    {property.type === 'buy' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : 'PG / Hostel'}
                  </span>
                  <span className="px-3.5 py-1 text-[11px] font-semibold tracking-wide bg-black/60 text-white backdrop-blur-md border border-white/20 rounded-full shadow-lg">
                    {propType}
                  </span>
                  {galleryImages.length > 1 && (
                    <span className="px-3.5 py-1 text-[11px] font-medium tracking-wide bg-black/75 text-[#e8d5b7] backdrop-blur-md border border-[#e8d5b7]/40 rounded-full shadow-lg">
                      Photo {activeImageIndex + 1} of {galleryImages.length}
                    </span>
                  )}
                </div>

                {/* Prev / Next Controls if multiple photos */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#e8d5b7] hover:text-black border border-[#e8d5b7]/40 hover:border-[#f5ebe0] backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer group/btn"
                      aria-label="Previous Photo"
                    >
                      <ChevronLeft className="size-6 group-hover/btn:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#e8d5b7] hover:text-black border border-[#e8d5b7]/40 hover:border-[#f5ebe0] backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 cursor-pointer group/btn"
                      aria-label="Next Photo"
                    >
                      <ChevronRight className="size-6 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Upgraded Small Square Thumbnail Gallery Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 sm:gap-4 pt-4 pb-5 px-2 overflow-x-auto scrollbar-none justify-start md:justify-center items-center">
                {galleryImages.map((imgUrl, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectImage(idx)}
                      className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-[#e8d5b7] ring-offset-2 ring-offset-[#09090c] scale-105 shadow-[0_0_20px_rgba(232,213,183,0.65)] z-10 border-2 border-[#f5ebe0] opacity-100'
                          : 'border border-white/25 opacity-60 hover:opacity-100 hover:scale-105 hover:border-[#e8d5b7]/70'
                      }`}
                    >
                      <img src={getImageUrl(imgUrl)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      {isActive && (
                        <span className="absolute top-1 right-1 size-2 bg-[#e8d5b7] rounded-full shadow-[0_0_6px_#e8d5b7]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MAIN MODAL BODY */}
          <div className="p-6 md:p-10 space-y-8">
            {/* Header Title & Price */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-2 max-w-2xl">
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl leading-tight">
                  {property.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-[14px] text-white/85">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-amber-400 shrink-0" />
                    <span className="font-medium">{property.location}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 md:text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
                <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold block">Listing Price</span>
                <span className="text-3xl font-black text-white tracking-tight">{property.price}</span>
              </div>
            </div>

            {/* DYNAMIC SPECS CARDS (Real Overview Data from raarya.com) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Square className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">Extent / Area</span>
                  <span className="text-[15px] font-bold text-white">{rawArea}</span>
                </div>
              </div>

              {property.beds > 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Bed className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">Bedrooms</span>
                    <span className="text-[15px] font-bold text-white">{property.beds} BHK</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Layers className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">Property Type</span>
                    <span className="text-[15px] font-bold text-white">{propType}</span>
                  </div>
                </div>
              )}

              {property.baths > 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Bath className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">Bathrooms</span>
                    <span className="text-[15px] font-bold text-white">{property.baths} Baths</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">Project Status</span>
                    <span className="text-[15px] font-bold text-white">{propStatus}</span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">Legal Approval</span>
                  <span className="text-[15px] font-bold text-emerald-400">DTCP Approved</span>
                </div>
              </div>
            </div>

            {/* 2-Column Grid: Left (Structured Points, Dynamic Overview Table, Maps) + Right (New Ultra-Modern Listed By Card) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-8">
                {/* STRUCTURED POINT-BY-POINT DESCRIPTION WITH STYLISH TYPOGRAPHY */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl tracking-wide text-amber-300 font-bold flex items-center gap-2 border-b border-white/10 pb-3">
                    <ShieldCheck className="size-5 text-amber-400" />
                    Property Overview & Highlights
                  </h3>

                  {descPoints.length > 0 ? (
                    <div className="space-y-3.5 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                      {descPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="size-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                            <CheckCircle className="size-3.5" />
                          </div>
                          <p className="text-white/90 text-[14.5px] leading-relaxed font-normal">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white/90 text-[14.5px] leading-relaxed">
                      {property.description}
                    </div>
                  )}
                </div>

                {/* DYNAMIC OVERVIEW SPECIFICATIONS TABLE WITH ULTRA-PREMIUM LUXURY DESIGN */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <h3 className="font-serif text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-extrabold flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Building className="size-5" />
                      </div>
                      Complete Property Specifications
                    </h3>
                    <span className="hidden sm:inline-block text-[11px] font-mono font-semibold tracking-wider text-amber-400/90 uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                      Verified Details
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {/* Item 1: Listed For */}
                    <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-[#181824]/90 via-[#12121c]/95 to-[#0d0d14] border border-white/10 hover:border-amber-400/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(245,158,11,0.2)] cursor-default">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
                          <Tag className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 block font-mono">Listed For</span>
                          <span className="text-[14.5px] font-extrabold text-white tracking-tight block truncate">{propListedFor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 2: Property Type */}
                    <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-[#181824]/90 via-[#12121c]/95 to-[#0d0d14] border border-white/10 hover:border-amber-400/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(245,158,11,0.2)] cursor-default">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
                          <Building className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 block font-mono">Property Type</span>
                          <span className="text-[14.5px] font-extrabold text-white tracking-tight block truncate">{propType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 3: Extent / Area */}
                    <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-[#181824]/90 via-[#12121c]/95 to-[#0d0d14] border border-white/10 hover:border-amber-400/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(245,158,11,0.2)] cursor-default">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
                          <Square className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 block font-mono">Extent / Area</span>
                          <span className="text-[14.5px] font-extrabold text-white tracking-tight block truncate">{rawArea}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 4: Construction Status */}
                    <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-[#181824]/90 via-[#12121c]/95 to-[#0d0d14] border border-white/10 hover:border-amber-400/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(245,158,11,0.2)] cursor-default">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
                          <Clock className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 block font-mono">Construction Status</span>
                          <span className="text-[14.5px] font-extrabold text-emerald-400 tracking-tight block truncate">{propStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 5: Furnishing */}
                    <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-[#181824]/90 via-[#12121c]/95 to-[#0d0d14] border border-white/10 hover:border-amber-400/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(245,158,11,0.2)] cursor-default">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
                          <Layers className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 block font-mono">Furnishing</span>
                          <span className="text-[14.5px] font-extrabold text-white tracking-tight block truncate">{propFurnishing}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 6: Legal Approvals */}
                    <div className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-[#181824]/90 via-[#12121c]/95 to-[#0d0d14] border border-white/10 hover:border-amber-400/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(245,158,11,0.2)] cursor-default">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
                          <ShieldCheck className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 block font-mono">Legal Approvals</span>
                          <span className="text-[14.5px] font-extrabold text-emerald-400 tracking-tight block truncate">DTCP & RERA Approved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PROPERTY ADDRESS SECTION */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-serif text-lg tracking-wide text-amber-300 font-bold flex items-center gap-2 border-b border-white/10 pb-3">
                    <MapPin className="size-5 text-amber-400" />
                    Address
                  </h3>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[14.5px] text-white font-medium leading-relaxed">
                      {property.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: NEW ULTRA-MODERN & LUXURIOUS LISTED BY CARD */}
              <div className="lg:col-span-4 space-y-6">
                {/* MODERN GLASSMORPHISM LISTED BY AGENT CARD */}
                <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-white/5 to-black/80 border border-amber-500/30 backdrop-blur-2xl shadow-2xl space-y-5">
                  <div className="absolute top-0 right-0 p-8 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-[11px] uppercase tracking-widest font-extrabold text-amber-400 flex items-center gap-1.5">
                      <UserCheck className="size-4" />
                      Verified Property Representative
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                      Active
                    </span>
                  </div>

                  {/* Representative Avatar & Name */}
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center shrink-0 font-black text-xl shadow-lg border border-amber-300">
                      {listerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-white tracking-tight capitalize leading-tight">
                        {listerName}
                      </h4>
                      <p className="text-[13px] text-white/70 font-mono">
                        +91 {primaryPhone}
                      </p>
                    </div>
                  </div>

                  {/* Direct Actions */}
                  <div className="space-y-2.5 pt-2">
                    <a
                      href={`https://api.whatsapp.com/send?phone=+91${primaryPhone}&text=${whatsappMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13.5px] rounded-2xl shadow-lg transition-all"
                    >
                      <MessageSquare className="size-4" />
                      Chat with {listerName} on WhatsApp
                    </a>

                    <a
                      href={`tel:+91${primaryPhone}`}
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[13.5px] rounded-2xl shadow-lg transition-all"
                    >
                      <Phone className="size-4" />
                      Call Agent (+91 {primaryPhone})
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowFullEnquiryModal(true)}
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-[14px] font-extrabold rounded-2xl border border-amber-300 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer tracking-wide"
                    >
                      <CalendarCheck className="size-4 text-slate-950 stroke-[2.5]" />
                      <span>Send Full Enquiry</span>
                    </button>
                  </div>
                </div>

                {/* Inline Site Visit Enquiry Form */}
                {showEnquiryForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4"
                  >
                    <h4 className="text-sm font-bold text-white">Book Site Inspection</h4>
                    {formSubmitted ? (
                      <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
                        ✓ Request submitted! {listerName} will call you shortly.
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setFormSubmitted(true);
                        }}
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Mobile Number"
                          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-amber-500 text-black font-bold text-xs rounded-lg shadow hover:bg-amber-400 transition-colors"
                        >
                          Submit Visit Request
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <EnquiryModal
        isOpen={showFullEnquiryModal}
        onClose={() => setShowFullEnquiryModal(false)}
        propertyName={property.title}
        propertyPrice={property.price}
        propertyLocation={property.location}
      />
    </AnimatePresence>
  );
}
