'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { initMap, sailTo } from '../lib/mapUtils';
import ThornFrame from './ThornFrame';

export default function MapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<any>(null);
  const shipRef = useRef<any>(null);
  const [dest, setDest] = useState('Awaiting destination...');
  const [prog, setProg] = useState(0);
  const [status, setStatus] = useState('Choose a land to begin the voyage.');

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    initMap({
      container: mapRef.current,
      onCountryClick: (name, coords) => {
        setDest(name); setStatus('The ship sets sail...'); setProg(0);
        if (shipRef.current && mapInst.current) {
          sailTo(mapInst.current, coords, shipRef.current, setProg, () => { setProg(100); setStatus('Voyage complete — treasure found!'); });
        }
      },
    }).then(({ map, shipMarker }) => { mapInst.current = map; shipRef.current = shipMarker; });
    return () => { if (mapInst.current) mapInst.current.remove(); mapInst.current = null; };
  }, []);

  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="tm-map-section">
      <div className="tm-container">
        <h2 className="tm-h2">The Ancient Chart</h2>
        <div className="tm-divider" />
        <p className="tm-h2-sub">Click kingdoms, landmarks &amp; compass roses — the chart answers with ink and gold.</p>
      </div>

      <div className="tm-container" style={{ marginTop: '1.5rem' }}>
        <div className="tm-map-wrap">
          <div ref={mapRef} className="tm-map" />
          <div className="tm-mist" aria-hidden />
          <div className="tm-map-burn" aria-hidden />
          <ThornFrame />

          <div className="tm-cartouche">
            <div className="tm-cart-title">Tabula Terrae</div>
            <div className="tm-cart-sub">The Great Chart of the Known World · Anno 1692</div>
          </div>

          <div className="tm-compass" aria-hidden>
            <div className="tm-compass-ring" />
            <div className="tm-compass-needle" />
            <span className="tm-c-n">N</span><span className="tm-c-s">S</span>
            <span className="tm-c-e">E</span><span className="tm-c-w">W</span>
          </div>

          <div className="tm-scale" aria-hidden>
            <div className="tm-scale-bars"><i /><i /><i /><i /></div>
            <div className="tm-scale-labels"><span>0</span><span>100</span><span>200</span><span>300</span><span>Leagues</span></div>
          </div>

          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }} className="tm-panel tm-voyage">
            <div className="tm-panel-title">⚜ Current Expedition ⚜</div>
            <div className="tm-dest">{dest}</div>
            <div className="tm-progress"><div className="tm-progress-fill" style={{ width: `${prog}%` }} /></div>
            <div className="tm-status">{status}</div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
