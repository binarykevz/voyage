'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="mt-12 py-10 px-4 text-center bg-ink-dark text-parchment-light border-t-4 border-double border-gold">
      <p>
        Written with{' '}
        <motion.span
          className="inline-block"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🧭
        </motion.span>{' '}
        in the salt-stained pages of adventure.
      </p>
      <p className="mt-3 font-label text-xs opacity-70">
        "Smooth seas do not make skillful sailors."
      </p>
      <p className="mt-6 text-xs opacity-50">
        © {new Date().getFullYear()} The Explorer's Journal
      </p>
    </footer>
  );
}
