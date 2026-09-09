'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Header() {
  const [clock, setClock] = useState('Loading...');
  useEffect(() => {
    const update = () => setClock(new Date().toLocaleString());
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative py-10 px-4 text-center border-b-4 border-double border-ink-light/40 z-10 bg-parchment">
      <h1 className="font-title text-4xl md:text-6xl uppercase tracking-widest text-ink-dark text-shadow-vintage">The Explorer's Journal</h1>
      <p className="mt-3 text-ink-mid italic font-old text-lg">A Chronicle of Distant Lands</p>
      <div className="mt-6 flex justify-center gap-3 flex-wrap">
        <span className="px-4 py-2 border-2 border-dashed border-ink-light bg-parchment-light/50 font-label text-xs">{clock}</span>
      </div>
    </motion.header>
  );
}
