'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getRandomMemories, type MediaItem } from '../lib/api';

export default function JournalGrid() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRandomMemories()
      .then((r) => { setItems(r.items); setSource(r.source); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="tm-container" style={{ padding: '3rem 1rem' }}>
      <h2 className="tm-h2">Log Entries</h2>
      <div className="tm-divider" />
      <p className="tm-h2-sub">Recovered pages from the captain&apos;s weathered journal.</p>

      <div className="tm-grid tm-grid-3" style={{ marginTop: '2rem' }}>
        {loading && <div className="tm-card"><div className="tm-card-body">Unrolling the scrolls…</div></div>}
        {!loading && items.length === 0 && <div className="tm-card"><div className="tm-card-body">The hold is empty. No relics found in the archives.</div></div>}
        {!loading &&
          items.map((item, i) => (
            <motion.article
              key={item.id || i}
              initial={{ opacity: 0, y: 40, rotate: i % 2 ? 1.2 : -1.2 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 0.6 : -0.6 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.12 }}
              className="tm-card"
            >
              <span className="tm-mini-seal" aria-hidden>✦</span>
              <div className="tm-badge">{item.mediaType === 'image' ? 'Photograph' : 'Moving Picture'}</div>
              <div className="tm-media">
                {item.mediaType === 'image' ? (
                  <img src={item.url} alt={item.title || 'Relic'} loading="lazy" />
                ) : (
                  <video src={item.url} controls playsInline preload="metadata" />
                )}
              </div>
              <div className="tm-card-body">
                <h3 className="tm-title-card">{item.title || 'Untitled Discovery'}</h3>
                <p className="tm-quote">&ldquo;{item.description || 'A remarkable find from the voyage.'}&rdquo;</p>
                <div className="tm-label">Entry No. {i + 1}</div>
              </div>
            </motion.article>
          ))}
      </div>
    </section>
  );
}
