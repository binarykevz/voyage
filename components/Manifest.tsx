'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStatsResilient, debugRawFetch, type Stats } from '../lib/api';

export default function Manifest() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [rawApi, setRawApi] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setStats(await getStatsResilient());
    setLoading(false);
  }, []);

    const checkDiagnostic = async () => {
    try {
      const r = await fetch('/api/archive/media?diagnostic=true'); // ✅ NEW
      setDiagnostic(await r.json());
    } catch (e: any) {
      setDiagnostic({ error: String(e) });
    }
  };

  const checkRawApi = async () => {
    const raw = await debugRawFetch('?country=Portugal');
    setRawApi(raw);
  };

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

      <div style={{ textAlign: 'center', marginTop: '1.4rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="tm-btn-quill" onClick={load}>🪶 Re-consult</button>
        <button className="tm-btn-quill" onClick={checkDiagnostic}>🔍 Env Vars</button>
        <button className="tm-btn-quill" onClick={checkRawApi}>🐛 Debug API</button>
      </div>

      {diagnostic && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(212,184,140,0.95)', border: '2px solid #6b4a22', borderRadius: '4px' }}>
          <strong>Env Vars Diagnostic:</strong>
          <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{JSON.stringify(diagnostic, null, 2)}</pre>
        </div>
      )}

      {rawApi && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(212,184,140,0.95)', border: '2px solid #6b4a22', borderRadius: '4px' }}>
          <strong>Raw API Response (Portugal):</strong>
          <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap', maxHeight: '300px', overflow: 'auto' }}>
            {JSON.stringify(rawApi, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

// ... keep your ManiCard component exactly as it was below this ...
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
