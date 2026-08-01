import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function LuxuryLoader() {
  const [techLines, setTechLines] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<string>('');

  useEffect(() => {
    const lines = [
      'ACCESSING PREMIUM PLOT DATABASE...',
      'VERIFYING DTCP & RERA APPROVED LISTINGS...',
      'LOADING PLOT LAND & INVENTORY MAPS...',
      'ESTABLISHING SECURE TRANSACTION PORTAL...'
    ];

    const timers: any[] = [];
    lines.forEach((line, idx) => {
      timers.push(
        setTimeout(() => {
          setTechLines((prev) => [...prev, line]);
        }, idx * 650)
      );
    });

    // Step-by-step progress tracking for BUY -> RENT -> PG/HOSTEL
    const t1 = setTimeout(() => setActiveStep('buy'), 600);
    const t2 = setTimeout(() => setActiveStep('rent'), 1600);
    const t3 = setTimeout(() => setActiveStep('pg'), 2500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const radius = 82;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        y: -100,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 bg-[#FAF7F2] z-[99999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(184, 144, 71, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(184, 144, 71, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        backgroundPosition: 'center center'
      }}
    >
      {/* Radial vignette fade for the blueprint grid */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 10%, #FAF7F2 85%)'
        }}
      />

      {/* Decorative architectural layout info in corners */}
      <div className="absolute top-6 left-6 font-mono text-[9px] text-[#A89F91] tracking-wider select-none leading-relaxed hidden sm:block">
        <div>MARKETPLACE: RAARYA_GROUPS_V1</div>
        <div>INVENTORY: VERIFIED_PLOTS</div>
        <div>TRANSACTION: SECURE_SSL</div>
      </div>
      <div className="absolute top-6 right-6 font-mono text-[9px] text-[#A89F91] tracking-wider select-none text-right leading-relaxed hidden sm:block">
        <div>LISTINGS: 1,250+ ACTIVE</div>
        <div>REGION: TAMIL_NADU</div>
        <div>BROKERAGE: RERA_APPROVED</div>
      </div>

      <div className="relative flex flex-col items-center max-w-sm px-4">
        {/* Decorative Golden Aura behind the 3D drawing */}
        <div className="absolute w-[260px] h-[260px] rounded-full bg-amber-500/[0.04] blur-[80px] pointer-events-none" />

        {/* 3D Isometric Architectural Wireframe SVG */}
        <svg 
          className="w-76 h-72 select-none relative z-10" 
          viewBox="0 0 300 280"
          fill="none"
        >
          {/* Circular Step-by-Step HUD ring centered at (150, 140) */}
          <g>
            {/* Background thin track ring */}
            <circle
              cx="150"
              cy="140"
              r={radius}
              stroke="rgba(184, 144, 71, 0.08)"
              strokeWidth="1.5"
            />
            {/* Active Tracing Ring - starts at top (12 o'clock) and draws clockwise */}
            <motion.circle
              cx="150"
              cy="140"
              r={radius}
              stroke="#B89047"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              transform="rotate(-90 150 140)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: 0 }}
              transition={{
                duration: 2.8,
                ease: "easeInOut"
              }}
            />

            {/* Step 1: BUY (Top-Right at 330 deg / x=221, y=99) */}
            <circle
              cx="221"
              cy="99"
              r="3.5"
              fill={activeStep === 'buy' || activeStep === 'rent' || activeStep === 'pg' ? "#B89047" : "#E2DCD3"}
              stroke="#FAF7F2"
              strokeWidth="1"
              className="transition-colors duration-300"
            />
            {(activeStep === 'buy' || activeStep === 'rent' || activeStep === 'pg') && (
              <motion.circle
                cx="221"
                cy="99"
                r="8"
                stroke="#B89047"
                strokeWidth="1"
                fill="transparent"
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <text
              x="229"
              y="102"
              textAnchor="start"
              className="font-mono text-[9px] tracking-wider transition-all duration-300 select-none"
              fill={activeStep === 'buy' || activeStep === 'rent' || activeStep === 'pg' ? "#141414" : "#A89F91"}
              style={{ fontWeight: activeStep === 'buy' || activeStep === 'rent' || activeStep === 'pg' ? '800' : '400' }}
            >
              BUY
            </text>

            {/* Step 2: RENT (Bottom-Center at 90 deg / x=150, y=222) */}
            <circle
              cx="150"
              cy="222"
              r="3.5"
              fill={activeStep === 'rent' || activeStep === 'pg' ? "#B89047" : "#E2DCD3"}
              stroke="#FAF7F2"
              strokeWidth="1"
              className="transition-colors duration-300"
            />
            {(activeStep === 'rent' || activeStep === 'pg') && (
              <motion.circle
                cx="150"
                cy="222"
                r="8"
                stroke="#B89047"
                strokeWidth="1"
                fill="transparent"
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <text
              x="150"
              y="238"
              textAnchor="middle"
              className="font-mono text-[9px] tracking-wider transition-all duration-300 select-none"
              fill={activeStep === 'rent' || activeStep === 'pg' ? "#141414" : "#A89F91"}
              style={{ fontWeight: activeStep === 'rent' || activeStep === 'pg' ? '800' : '400' }}
            >
              RENT
            </text>

            {/* Step 3: PG / HOSTEL (Top-Left at 210 deg / x=79, y=99) */}
            <circle
              cx="79"
              cy="99"
              r="3.5"
              fill={activeStep === 'pg' ? "#B89047" : "#E2DCD3"}
              stroke="#FAF7F2"
              strokeWidth="1"
              className="transition-colors duration-300"
            />
            {activeStep === 'pg' && (
              <motion.circle
                cx="79"
                cy="99"
                r="8"
                stroke="#B89047"
                strokeWidth="1"
                fill="transparent"
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <text
              x="71"
              y="102"
              textAnchor="end"
              className="font-mono text-[9px] tracking-wider transition-all duration-300 select-none"
              fill={activeStep === 'pg' ? "#141414" : "#A89F91"}
              style={{ fontWeight: activeStep === 'pg' ? '800' : '400' }}
            >
              PG / HOSTEL
            </text>
          </g>

          {/* Ground Plot Grid Lines */}
          <g opacity="0.5">
            <motion.line
              x1="132.7" y1="140" x2="202.0" y2="180"
              stroke="rgba(184, 144, 71, 0.3)" strokeWidth="0.75"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <motion.line
              x1="115.4" y1="150" x2="184.6" y2="190"
              stroke="rgba(184, 144, 71, 0.3)" strokeWidth="0.75"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            />
            <motion.line
              x1="98.0" y1="160" x2="167.3" y2="200"
              stroke="rgba(184, 144, 71, 0.3)" strokeWidth="0.75"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
            <motion.line
              x1="167.3" y1="140" x2="98.0" y2="180"
              stroke="rgba(184, 144, 71, 0.3)" strokeWidth="0.75"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.05, ease: "easeOut" }}
            />
            <motion.line
              x1="184.6" y1="150" x2="115.4" y2="190"
              stroke="rgba(184, 144, 71, 0.3)" strokeWidth="0.75"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            />
            <motion.line
              x1="202.0" y1="160" x2="132.7" y2="200"
              stroke="rgba(184, 144, 71, 0.3)" strokeWidth="0.75"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            />
          </g>

          {/* Plot Boundary Diamond */}
          <motion.polygon
            points="80.7,170 150,130 219.3,170 150,210"
            stroke="#B89047" strokeWidth="1.25" strokeDasharray="3 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, delay: 0.3, ease: "easeInOut" }}
          />

          {/* 3D Villa - First Level (Ground Floor Structure) */}
          {/* Base Diamond */}
          <motion.polygon
            points="100,175 150,148 200,175 150,202"
            stroke="#B89047" strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
          />
          {/* Vertical Extrusions */}
          <g>
            <motion.line
              x1="100" y1="175" x2="100" y2="140"
              stroke="#B89047" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }}
            />
            <motion.line
              x1="150" y1="148" x2="150" y2="113"
              stroke="#B89047" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
            />
            <motion.line
              x1="200" y1="175" x2="200" y2="140"
              stroke="#B89047" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
            />
            <motion.line
              x1="150" y1="202" x2="150" y2="167"
              stroke="#B89047" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }}
            />
          </g>
          {/* Ceiling Diamond */}
          <motion.polygon
            points="100,140 150,113 200,140 150,167"
            stroke="#B89047" strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, delay: 1.3, ease: "easeInOut" }}
          />

          {/* 3D Villa - Second Level (Overhanging Upper Floor Structure) */}
          {/* Base */}
          <motion.polygon
            points="125,153.5 175,126.5 210,145.5 160,172.5"
            stroke="#141414" strokeWidth="1.25" opacity="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeInOut" }}
          />
          {/* Vertical Extrusions */}
          <g>
            <motion.line
              x1="125" y1="153.5" x2="125" y2="123.5"
              stroke="#141414" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 1.7, ease: "easeOut" }}
            />
            <motion.line
              x1="175" y1="126.5" x2="175" y2="96.5"
              stroke="#141414" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
            />
            <motion.line
              x1="210" y1="145.5" x2="210" y2="115.5"
              stroke="#141414" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 1.9, ease: "easeOut" }}
            />
            <motion.line
              x1="160" y1="172.5" x2="160" y2="142.5"
              stroke="#141414" strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 1.7, ease: "easeOut" }}
            />
          </g>
          {/* Roof Diamond */}
          <motion.polygon
            points="125,123.5 175,96.5 210,115.5 160,142.5"
            stroke="#141414" strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, delay: 2.0, ease: "easeInOut" }}
          />

          {/* Plot Location Pin */}
          <g>
            {/* Pulsing Ground Ring */}
            <motion.ellipse
              cx="180" cy="190"
              rx="9" ry="4.5"
              stroke="#B89047" strokeWidth="1"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.5],
                opacity: [0.8, 0]
              }}
              transition={{
                delay: 2.2,
                duration: 1.2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            {/* Dropping Pin */}
            <motion.path
              d="M 180,190 C 175,180 170,175 170,170 C 170,164.5 174.5,160 180,160 C 185.5,160 190,164.5 190,170 C 190,175 185,180 180,190 Z"
              fill="#B89047" stroke="#FAF7F2" strokeWidth="0.5"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 2.1,
                type: "spring",
                stiffness: 180,
                damping: 9
              }}
            />
            {/* Small white dot in Pin */}
            <motion.circle
              cx="180" cy="170" r="2.5"
              fill="#FAF7F2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.3 }}
            />
          </g>

          {/* Verified Plot Status Badge hovering above the location pin */}
          <g>
            <motion.rect
              x="145"
              y="132"
              width="70"
              height="15"
              rx="3"
              fill="rgba(184, 144, 71, 0.06)"
              stroke="#B89047"
              strokeWidth="0.75"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.4, ease: "easeOut" }}
            />
            <motion.text
              x="180"
              y="142"
              textAnchor="middle"
              fill="#B89047"
              className="font-mono text-[7px] tracking-wider select-none font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.3 }}
            >
              VERIFIED PLOT
            </motion.text>
          </g>
        </svg>

        {/* Text Area */}
        <div className="flex flex-col items-center mt-4 text-center w-full">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[#1A1815] tracking-[0.22em] font-extrabold text-[15px] uppercase select-none"
          >
            PREMIUM PLOTS BUYING & SELLING
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-[#B89047] text-[11px] tracking-[0.25em] font-extrabold uppercase mt-1.5 select-none"
          >
            RAARYA GROUPS
          </motion.div>

          {/* Tech/Coordinate Log Stream (Simulating terminal feedback) */}
          <div className="w-full mt-6 bg-[#141414]/[0.02] border border-[#B89047]/10 rounded-lg p-3 min-h-[56px] text-left font-mono text-[8px] text-[#8C8476] select-none flex flex-col gap-1 leading-normal">
            {techLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-[#B89047] font-semibold">❯</span>
                <span>{line}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default LuxuryLoader;
