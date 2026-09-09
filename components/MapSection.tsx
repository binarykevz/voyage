'use client';
import { useEffect, useRef, useState } from 'react';
import { initMap, sailTo, type CountryItem } from '../lib/mapUtils';

export default function MapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const shipRef = useRef<any>(null);
  const [dest, setDest] = useState('Awaiting destination...');
  const [prog, setProg] = useState(0);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    initMap({
      container: mapRef.current,
      onCountryClick: (name, coords) => {
        setDest(name);
        if (shipRef.current) sailTo(mapInstance.current, coords, shipRef.current, setProg, () => setProg(100));
      }
    }).then(({ map, shipMarker }) => {
      mapInstance.current = map;
      shipRef.current = shipMarker;
    });
    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, []);

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] border-b-4 border-double border-ink-light/40">
      <div ref={mapRef} className="w-full h-full" />
      <div className="map-vignette" />
      <div className="absolute left-5 bottom-5 w-[300px] z-[1000] p-4 bg-parchment-light/95 border-2 border-ink-light shadow-vintage">
        <div className="font-label text-xs uppercase tracking-widest opacity-70">Current Expedition</div>
        <div className="mt-1 text-xl font-bold font-title">{dest}</div>
        <div className="h-1.5 mt-3 bg-ink-light/20 overflow-hidden">
          <div className="h-full bg-ink-mid transition-all" style={{ width: `${prog}%` }} />
        </div>
      </div>
    </section>
  );
}
