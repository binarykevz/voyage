'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStatsResilient, type Stats } from '../lib/api';

export default function Manifest() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setStats(await getStatsResilient());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const val = (v: number | null | undefined) => (v == null ? '—' : String(v));

  return (
    <section className="tm-container" style={{ padding: '3rem 1rem 0' }} id="manifest">
      <h2 className="tm-h2">Voyage Manifest</h2>
      <div className="tm-divider" />
      <p className="tm-h2-sub">A registry of all treasures recovered from the archives.</p>

      <div className="tm-grid tm-grid-4" style={{ marginTop: '2rem' }}>
        <ManiCard label="Total Treasures" value={loading ? '…' : val(stats?.total)} sub="Artifacts recovered." delay={0} />
        <ManiCard label="Photographs" value={loading ? '…' : val(stats?.photos)} sub="Pressed moments." delay={0.1} />
        <ManiCard label="Moving Pictures" value={loading ? '…' : val(stats?.videos)} sub="Living memories." delay={0.2} />
        <ManiCard
          label="Archive"
          value={loading ? 'Scrying…' : stats?.apiOnline ? 'Online' : 'Offline'}
          sub={stats?.apiOnline ? `Route: ${stats?.source}` : `Error: ${stats?.error || 'Unknown'}`}
          delay={0.3}
          tone={stats?.apiOnline}
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.4rem' }}>
        <button className="tm-btn-quill" onClick={load}>🪶 Re-consult the Archives</button>
      </div>
    </section>
  );
}

function ManiCard({ label, value, sub, delay, tone }: { label: string; value: string; sub: string; delay: number; tone?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="tm-card"
    >
      <div className="tm-card-body">
        <div className="tm-label">{label}</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className={`tm-value ${tone === true ? 'tm-online' : tone === false ? 'tm-offline' : ''}`}
          >
            {value}
          </motion.div>
        </AnimatePresence>
        <div className="tm-sub" style={{ fontSize: '0.75rem', color: tone === false ? '#8a3b1e' : undefined }}>{sub}</div>
      </div>
    </motion.div>
  );
}
