
'use client';
import { motion } from 'framer-motion';

export default function LogCard({ label, value, sub, delay = 0 }: { label: string; value: string | number; sub: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }} className="p-6 bg-gradient-to-b from-parchment-light/60 to-parchment-dark/60 border-2 border-ink-light shadow-vintage">
      <div className="font-label text-xs uppercase tracking-widest text-ink-mid mb-2">{label}</div>
      <div className="font-hand text-4xl text-ink-dark leading-none">{value}</div>
      <div className="mt-3 text-sm text-ink-mid italic">{sub}</div>
    </motion.div>
  );
}
