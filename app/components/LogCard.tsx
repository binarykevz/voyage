'use client';

import { motion } from 'framer-motion';

interface LogCardProps {
  label: string;
  value: string | number;
  sub: string;
  delay?: number;
}

export default function LogCard({ label, value, sub, delay = 0 }: LogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(50, 30, 5, 0.4)' }}
      className="p-6 bg-gradient-to-b from-[rgba(235,211,155,0.6)] to-[rgba(211,182,119,0.6)] border-2 border-ink-light shadow-vintage transition-all"
    >
      <div className="font-label text-xs uppercase tracking-widest text-ink-mid mb-2">
        {label}
      </div>
      <div className="font-hand text-4xl text-ink-dark leading-none">{value}</div>
      <div className="mt-3 text-sm text-ink-mid italic">{sub}</div>
    </motion.div>
  );
}
