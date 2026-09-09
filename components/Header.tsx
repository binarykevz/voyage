'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Header() {
  const [clock, setClock] = useState('Charting time...');
  useEffect(() => {
    const u = () => setClock(new Date().toLocaleString());
    u();
    const i = setInterval(u, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.header initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="tm-header">
      <motion.div className="tm-seal" animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 6, repeat: Infinity }}>✦</motion.div>
      <h1 className="tm-title tm-gold">The Explorer&apos;s Journal</h1>
      <p className="tm-subtitle">~ A Chronicle of Distant Lands &amp; Buried Treasure ~</p>
      <div className="tm-flex tm-meta">
        <span className="tm-stamp">🕰 {clock}</span>
        <span className="tm-stamp">⚓ Voyage No. 42</span>
      </div>
    </motion.header>
  );
}
