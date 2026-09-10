'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROSE = (
  <svg className="loader-rose" viewBox="0 0 100 100">
    <g stroke="#4a3018" fill="none" strokeWidth="1">
      <circle cx="50" cy="50" r="46" opacity=".85" />
      <circle cx="50" cy="50" r="34" opacity=".6" />
      <circle cx="50" cy="50" r="6" />
      <g fill="#4a3018" fillOpacity=".85" stroke="none">
        <path d="M50 4 L55 45 L50 50 L45 45 Z" />
        <path d="M50 96 L55 55 L50 50 L45 55 Z" fillOpacity=".55" />
        <path d="M4 50 L45 45 L50 50 L45 55 Z" fillOpacity=".55" />
        <path d="M96 50 L55 45 L50 50 L55 55 Z" fillOpacity=".55" />
        <path d="M18 18 L46 46 L50 50 L44 44 Z" fillOpacity=".4" />
        <path d="M82 18 L54 46 L50 50 L56 44 Z" fillOpacity=".4" />
        <path d="M18 82 L46 54 L50 50 L44 56 Z" fillOpacity=".4" />
        <path d="M82 82 L54 54 L50 50 L56 56 Z" fillOpacity=".4" />
      </g>
      <text x="50" y="13" textAnchor="middle" fontSize="10" fill="#4a3018" fontFamily="Cinzel,serif" stroke="none">N</text>
    </g>
  </svg>
);

export default function AncientLoader() {
  const [show, setShow] = useState(true);
  const [seal, setSeal] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSeal(true), 2200);   // wax seal stamps near the end
    const t2 = setTimeout(() => setShow(false), 3000); // veil lifts at 3s
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="loader-veil" exit={{ opacity: 0, transition: { duration: 0.7 } }}>
          <div className="loader-dust" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 9) * 0.35}s`, animationDuration: `${2.2 + (i % 5) * 0.5}s` }} />
            ))}
          </div>

          <div className="loader-scroll">
            <div className="loader-rod loader-rod-t" />
            <div className="loader-rod loader-rod-b" />
            {ROSE}
            <div className="loader-title">Tabula Terrae</div>
            <div className="loader-text">Charting the unknown seas…</div>
            <svg className="loader-route" viewBox="0 0 200 26">
              <path d="M4 18 C30 4 52 24 78 12 C104 2 126 22 152 10 C170 3 184 12 196 8" />
            </svg>
            {seal && <div className="loader-seal">✦</div>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
