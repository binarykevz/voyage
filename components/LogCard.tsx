'use client';
import { motion } from 'framer-motion';

export default function LogCard({ label, value, sub, delay = 0 }: { label: string; value: string | number; sub: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30, rotate: -1 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }} className="tm-card">
      <div className="tm-card-body">
        <div className="tm-label">{label}</div>
        <div className="tm-value">{value}</div>
        <div className="tm-sub">{sub}</div>
      </div>
    </motion.div>
  );
}
