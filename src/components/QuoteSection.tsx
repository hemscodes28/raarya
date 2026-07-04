import { motion } from 'motion/react';

export function QuoteSection() {
  return (
    <section className="relative bg-[#F8F8F8] px-5 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-white border border-black/5 p-8 md:p-14 rounded-[24px] shadow-sm flex flex-col items-center text-center overflow-hidden"
        >
          {/* Subtle watermark quote marks */}
          <div className="absolute left-6 top-0 text-8xl md:text-9xl font-serif text-black/[0.03] pointer-events-none select-none">
            “
          </div>
          
          <blockquote className="relative z-10 max-w-3xl">
            <p className="text-lg md:text-2xl font-medium italic leading-relaxed text-[#141414]" data-editable>
              "Don't wait to buy land. Buy land and wait."
            </p>
            <cite className="mt-4 block text-[11px] font-semibold uppercase tracking-wider text-[#A5A5A5] not-italic" data-editable>
              — Will Rogers
            </cite>
          </blockquote>

          <div className="absolute right-6 bottom-0 text-8xl md:text-9xl font-serif text-black/[0.03] pointer-events-none select-none leading-none">
            ”
          </div>
        </motion.div>
      </div>
    </section>
  );
}
