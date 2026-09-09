import type { ReactNode } from 'react';
import { motion } from 'motion/react';

export function PageShell({
  title,
  subtitle,
  children,
  maxWidth = "max-w-[1536px]"
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="px-4 sm:px-6 md:px-10 pb-24 pt-4 md:pt-6">
      <div className={`mx-auto ${maxWidth}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-3xl"
        >
          <h1
            className="text-3xl font-medium leading-[1.1] tracking-tight text-[#141414] md:text-5xl"
            data-editable
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-700 font-lora italic tracking-wide md:text-[17px]" data-editable>
              {subtitle}
            </p>
          ) : null}
        </motion.div>
        {children}
      </div>
    </div>
  );
}
