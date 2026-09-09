'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getRandomMemories, type MediaItem } from '../lib/api';

export default function JournalGrid() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRandomMemories().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="col-span-full text-center py-20 font-title text-2xl text-ink-dark">Consulting the Archives...</div>;
  if (!items.length) return <div className="col-span-full text-center py-20 font-title text-2xl text-ink-dark">Empty Hold</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item, i) => (
        <motion.article key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="bg-parchment-light border-2 border-ink-light shadow-vintage overflow-hidden relative group">
          <div className="p-4 bg-ink-light/10 border-b-2 border-ink-light">
            <div className="h-[280px] overflow-hidden border-[3px] border-ink-dark bg-parchment-dark">
              {item.mediaType === 'image' ? (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: 'sepia(0.4) contrast(0.95)' }} />
              ) : (
                <video src={item.url} controls className="w-full h-full object-cover" />
              )}
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-title text-2xl text-ink-dark mb-3">{item.title || 'Untitled'}</h3>
            <p className="font-hand text-xl text-ink-mid mb-5 pl-4 border-l-[3px] border-gold">"{item.description || 'A remarkable find.'}"</p>
            <div className="text-xs font-label text-ink-mid/60 absolute bottom-4 right-4">Entry {i + 1}</div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
