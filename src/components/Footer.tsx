import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube, Navigation, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();

    const targetHash = hash ? `#${hash.replace(/^#\/?/, '')}` : '#';
    window.location.hash = targetHash;

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 60);
  };

  const exactLocationUrl =
    "https://www.google.com/maps/place/11%C2%B000'44.0%22N+76%C2%B059'10.9%22E/@11.0123357,76.9865158,431a,75y,233.35h,90t/data=!3m7!1e1!3m5!1sAZ5WvLi8tkuBzrEnHlaP0A!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0%26panoid%3DAZ5WvLi8tkuBzrEnHlaP0A%26yaw%3D233.35289!7i16384!8i8192!4m4!3m3!8m2!3d11.0122222!4d76.9863611?hl=en&entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D";

  const pinterestUrl = "https://in.pinterest.com/raaryagroups/";

  return (
    <footer className="relative bg-[#0b0f19] text-white border-t border-white/15 overflow-hidden font-outfit pt-7 pb-4">
      {/* Ambient lighting backdrop glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* TOP BRAND & SOCIAL BAR WITH OUTFIT TYPOGRAPHY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
        {/* Raarya Brand Header */}
        <a
          href="#"
          onClick={(e) => handleNavClick(e, '')}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-white shadow-md border border-white/20 group-hover:scale-105 transition-transform duration-300">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="RAARYA Logo"
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="text-2xl font-black tracking-widest text-white uppercase font-heading-display group-hover:text-amber-400 transition-colors">
            RAARYA
          </span>
        </a>

        {/* Social Links with Compact Icons and High Contrast Pinterest */}
        <div className="flex items-center gap-3 font-outfit">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold mr-1">
            Follow Us:
          </span>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/RaaryaGroups"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="p-2.5 rounded-full bg-white/10 hover:bg-[#1877F2] text-white hover:text-white border border-white/20 hover:border-[#1877F2] transition-all duration-300 shadow-md hover:scale-125 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(24,119,242,0.8)]"
          >
            <Facebook className="size-4" />
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/raaryagroups/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="p-2.5 rounded-full bg-white/10 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] text-white border border-white/20 hover:border-transparent transition-all duration-300 shadow-md hover:scale-125 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(238,42,123,0.8)]"
          >
            <Instagram className="size-4" />
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/raarya-groups-332753283/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="p-2.5 rounded-full bg-white/10 hover:bg-[#0A66C2] text-white hover:text-white border border-white/20 hover:border-[#0A66C2] transition-all duration-300 shadow-md hover:scale-125 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(10,102,194,0.8)]"
          >
            <Linkedin className="size-4" />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@RaaryaGroups"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="p-2.5 rounded-full bg-white/10 hover:bg-[#FF0000] text-white hover:text-white border border-white/20 hover:border-[#FF0000] transition-all duration-300 shadow-md hover:scale-125 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,0,0,0.8)]"
          >
            <Youtube className="size-4" />
          </a>

          {/* Pinterest */}
          <a
            href={pinterestUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Pinterest"
            className="p-2.5 rounded-full bg-white/10 hover:bg-[#E60023] text-white hover:text-white border border-white/20 hover:border-[#E60023] transition-all duration-300 shadow-md hover:scale-125 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(230,0,35,0.8)]"
          >
            <svg className="size-4 fill-white text-white" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.4 2.967 7.4 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>

      {/* MAIN FOOTER COLUMNS - ELEGANT OUTFIT FONT & RICH CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-7 lg:gap-9 relative z-10 font-outfit">
        
        {/* Column 1: Contact Us */}
        <div className="lg:col-span-4 space-y-3.5">
          <h3 className="text-[17px] font-bold tracking-wide text-amber-400 border-b border-amber-500/25 pb-2">
            Contact Us
          </h3>
          <ul className="space-y-2 text-[15px] text-neutral-200">
            {/* Address */}
            <li>
              <a
                href={exactLocationUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 p-2.5 -ml-2.5 rounded-2xl border border-transparent hover:border-amber-400/30 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/[0.04] hover:to-transparent hover:shadow-[0_8px_25px_rgba(245,158,11,0.15)] hover:translate-x-1.5 transition-all duration-300 cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5 group-hover:scale-125 group-hover:bg-amber-400 group-hover:text-black transition-all duration-300">
                  <MapPin className="size-4" />
                </div>
                <span className="leading-relaxed group-hover:text-white group-hover:font-medium transition-colors">
                  2D, A-Block, Ram Apartment 642FF4, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037
                </span>
              </a>
            </li>

            {/* Phone */}
            <li>
              <a
                href="tel:+919087240400"
                className="group flex items-center gap-3 p-2.5 -ml-2.5 rounded-2xl border border-transparent hover:border-amber-400/30 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/[0.04] hover:to-transparent hover:shadow-[0_8px_25px_rgba(245,158,11,0.15)] hover:translate-x-1.5 transition-all duration-300"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 group-hover:scale-125 group-hover:bg-amber-400 group-hover:text-black transition-all duration-300">
                  <Phone className="size-4" />
                </div>
                <span className="group-hover:text-amber-300 font-bold text-[15.5px] transition-colors">
                  +91 90872 40400
                </span>
              </a>
            </li>

            {/* Email */}
            <li>
              <a
                href="mailto:raaryagroupsinfo@gmail.com"
                className="group flex items-center gap-3 p-2.5 -ml-2.5 rounded-2xl border border-transparent hover:border-amber-400/30 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/[0.04] hover:to-transparent hover:shadow-[0_8px_25px_rgba(245,158,11,0.15)] hover:translate-x-1.5 transition-all duration-300"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 group-hover:scale-125 group-hover:bg-amber-400 group-hover:text-black transition-all duration-300">
                  <Mail className="size-4" />
                </div>
                <span className="group-hover:text-amber-300 font-medium transition-colors truncate">
                  raaryagroupsinfo@gmail.com
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Quick links */}
        <div className="lg:col-span-3 space-y-3.5">
          <h3 className="text-[17px] font-bold tracking-wide text-amber-400 border-b border-amber-500/25 pb-2">
            Quick links
          </h3>
          <ul className="space-y-1.5 text-[15px] text-neutral-200 font-medium">
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, '')}
                className="group flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl border border-transparent hover:border-amber-400/40 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/5 hover:to-transparent hover:translate-x-2.5 hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black group-hover:scale-110 transition-all">
                  <span className="text-xs font-bold">▸</span>
                </div>
                <span className="group-hover:text-amber-300 group-hover:font-semibold transition-colors">Home</span>
              </a>
            </li>

            <li>
              <a
                href="#about"
                onClick={(e) => handleNavClick(e, 'about')}
                className="group flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl border border-transparent hover:border-amber-400/40 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/5 hover:to-transparent hover:translate-x-2.5 hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black group-hover:scale-110 transition-all">
                  <span className="text-xs font-bold">▸</span>
                </div>
                <span className="group-hover:text-amber-300 group-hover:font-semibold transition-colors">About Us</span>
              </a>
            </li>

            <li>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, 'contact')}
                className="group flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl border border-transparent hover:border-amber-400/40 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/5 hover:to-transparent hover:translate-x-2.5 hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black group-hover:scale-110 transition-all">
                  <span className="text-xs font-bold">▸</span>
                </div>
                <span className="group-hover:text-amber-300 group-hover:font-semibold transition-colors">Contact Us</span>
              </a>
            </li>

            <li>
              <a
                href="#emi-calculator"
                onClick={(e) => handleNavClick(e, 'emi-calculator')}
                className="group flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl border border-transparent hover:border-amber-400/40 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/5 hover:to-transparent hover:translate-x-2.5 hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black group-hover:scale-110 transition-all">
                  <span className="text-xs font-bold">▸</span>
                </div>
                <span className="group-hover:text-amber-300 group-hover:font-semibold transition-colors">EMI Calculator</span>
              </a>
            </li>

            <li>
              <a
                href="#eligibility-check"
                onClick={(e) => handleNavClick(e, 'eligibility-check')}
                className="group flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl border border-transparent hover:border-amber-400/40 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/5 hover:to-transparent hover:translate-x-2.5 hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black group-hover:scale-110 transition-all">
                  <span className="text-xs font-bold">▸</span>
                </div>
                <span className="group-hover:text-amber-300 group-hover:font-semibold transition-colors">Eligibility Check</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Other Links */}
        <div className="lg:col-span-2 space-y-3.5">
          <h3 className="text-[17px] font-bold tracking-wide text-amber-400 border-b border-amber-500/25 pb-2">
            Other Links
          </h3>
          <ul className="space-y-1.5 text-[15px] text-neutral-200 font-medium">
            <li>
              <a
                href="#blog"
                onClick={(e) => handleNavClick(e, 'blog')}
                className="group flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl border border-transparent hover:border-amber-400/40 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/5 hover:to-transparent hover:translate-x-2.5 hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black group-hover:scale-110 transition-all">
                  <span className="text-xs font-bold">▸</span>
                </div>
                <span className="group-hover:text-amber-300 group-hover:font-semibold transition-colors">Blog</span>
              </a>
            </li>

            <li>
              <a
                href="#post-property"
                onClick={(e) => handleNavClick(e, 'post-property')}
                className="group flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl border border-transparent hover:border-amber-400/40 hover:bg-gradient-to-r hover:from-amber-500/15 hover:via-white/5 hover:to-transparent hover:translate-x-2.5 hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-400 group-hover:text-black group-hover:scale-110 transition-all">
                  <span className="text-xs font-bold">▸</span>
                </div>
                <span className="group-hover:text-amber-300 group-hover:font-semibold transition-colors">Post Your Property</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Location Map with Luxury Gold Button */}
        <div className="lg:col-span-3 space-y-3.5">
          <h3 className="text-[17px] font-bold tracking-wide text-amber-400 border-b border-amber-500/25 pb-2">
            Location
          </h3>

          <div className="relative group rounded-2xl overflow-hidden border-2 border-white/20 hover:border-amber-400 shadow-2xl bg-black/60 hover:shadow-[0_0_35px_rgba(245,158,11,0.35)] hover:scale-[1.03] transition-all duration-500">
            {/* Embedded Google Map using exact coordinates */}
            <iframe
              title="Raarya Office Exact Location"
              src="https://maps.google.com/maps?q=11.0122222,76.9863611&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full aspect-[16/10] border-0 filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Floating Luxury Gold Overlay Button "View Office Location" */}
            <a
              href={exactLocationUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute inset-x-3 bottom-3 py-2.5 px-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-[13px] tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 border border-amber-300 transition-all duration-300 backdrop-blur-md active:scale-95 font-outfit"
            >
              <Navigation className="size-4 text-slate-950 stroke-[2.5]" />
              <span>View Office Location</span>
              <ExternalLink className="size-3.5 text-slate-950 opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div className="border-t border-white/10 bg-black/60 backdrop-blur-md py-4 font-outfit">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-300">
          <p className="font-semibold tracking-wide">
            Copyright © {currentYear} Raarya. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
