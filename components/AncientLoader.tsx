'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  'Unrolling the parchment…',
  'Inking the coastlines…',
  'Summoning the four winds…',
  'Sealing the chart with wax…',
];

const ROSE_PATHS = (
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
);

export default function AncientLoader() {
  const [show, setShow] = useState(true);
  const [stage, setStage] = useState(0);
  const [seal, setSeal] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1400),
      setTimeout(() => setStage(2), 2600),
      setTimeout(() => setStage(3), 3800),
      setTimeout(() => setSeal(true), 4300),
      setTimeout(() => setShow(false), 5000), // ← 5 seconds
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="loader-veil" exit={{ opacity: 0, transition: { duration: 0.6 } }}>
          {/* giant faded rose turning behind everything */}
          <div className="loader-bg-rose" aria-hidden>
            <svg viewBox="0 0 100 100">{ROSE_PATHS}</svg>
          </div>

          {/* route drawn across the whole screen */}
          <svg className="loader-route-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
            <path d="M-2 30 C15 12 30 34 48 18 C64 6 78 26 102 12" />
          </svg>

          {/* ship sailing across the screen */}
          <div className="loader-ship" aria-hidden>
            <div className="ship">
              <div className="mast" /><div className="sail" /><div className="flag" />
              <div className="ship-body" /><div className="wake" />
            </div>
          </div>

          <div className="loader-dust" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} style={{ left: `${(i * 41) % 100}%`, animationDelay: `${(i % 10) * 0.3}s`, animationDuration: `${2.4 + (i % 6) * 0.5}s` }} />
            ))}
          </div>

          <div className="loader-corner lc-tl">❦</div>
          <div className="loader-corner lc-tr">❦</div>
          <div className="loader-corner lc-bl">❦</div>
          <div className="loader-corner lc-br">❦</div>

          {/* the scroll itself (rolls up on exit) */}
          <motion.div className="loader-scroll" exit={{ scaleY: 0.06, opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}>
            <div className="loader-rod loader-rod-t" />
            <div className="loader-rod loader-rod-b" />
            <svg className="loader-rose" viewBox="0 0 100 100">{ROSE_PATHS}</svg>
            <div className="loader-title">Tabula Terrae</div>

            <div className="loader-stage-wrap">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stage}
                  className="loader-text"
                  initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45 }}
                >
                  {STAGES[stage]}
                </motion.p>
              </AnimatePresence>
            </div>

            <svg className="loader-route" viewBox="0 0 200 26">
              <path d="M4 18 C30 4 52 24 78 12 C104 2 126 22 152 10 C170 3 184 12 196 8" />
            </svg>

            <div className="loader-progress"><i /></div>
            {seal && <div className="loader-seal">✦</div>}
          </motion.div>

          <div className="loader-vignette" aria-hidden />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
