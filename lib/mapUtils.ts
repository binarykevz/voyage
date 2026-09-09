import L from 'leaflet';
import type { Map as LeafletMap, Marker } from 'leaflet';

const API_BASE = 'https://media-api.markmykevin.workers.dev/';

export interface CountryItem { name: string; onClick: () => void; }

const LANDMARKS: { type: 'mountain' | 'volcano'; coords: [number, number]; label: string }[] = [
  { type: 'volcano', coords: [37.75, 14.99], label: 'Mons Aetna — the mountain that breathes fire' },
  { type: 'volcano', coords: [-6.1, 105.42], label: 'Cracatoa — isle that vanished in smoke' },
  { type: 'volcano', coords: [35.36, 138.73], label: 'Fusi Yama — the sleeping sentinel' },
  { type: 'volcano', coords: [63.63, -19.62], label: 'Yma Fire — the ice that burns' },
  { type: 'mountain', coords: [46.5, 9.8], label: 'Montes Alpi — peaks that scrape heaven' },
  { type: 'mountain', coords: [28.0, 86.9], label: 'Himalaya — throne of the snow gods' },
  { type: 'mountain', coords: [-32.6, -70.1], label: 'Cordillera — spine of the western world' },
  { type: 'mountain', coords: [39.5, -105.8], label: 'Montes Robusti — walls of the wild west' },
  { type: 'mountain', coords: [31.06, -7.9], label: 'Atlas — where the sky is held aloft' },
  { type: 'mountain', coords: [56.0, 59.0], label: 'Ural — the seam betwixt two worlds' },
];

function hashName(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function baseStyle(name: string) {
  const green = hashName(name) % 2 === 0;
  return { color: '#5d4a26', weight: 1, fillColor: green ? '#8f9e7b' : '#a8916b', fillOpacity: 0.55 };
}

function landmarkHtml(type: 'mountain' | 'volcano', label: string) {
  const icon = type === 'volcano' ? '🌋' : '⛰️';
  const smoke = type === 'volcano' ? '<span class="lm-smoke"></span><span class="lm-smoke lm-s2"></span>' : '';
  return `<div class="lm lm-${type}">${smoke}<span class="lm-icon">${icon}</span><span class="lm-label">${label}</span></div>`;
}

const safe = (s: any) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));

async function openArchivePopup(lyr: any, name: string) {
  let html = `<div class="tm-popup"><div class="tm-popup-title">⚜ ${safe(name)}</div><div class="popup-img-fallback">🕰</div><p class="tm-popup-desc">Consulting the archives…</p></div>`;
  lyr.bindPopup(html, { maxWidth: 260, className: 'tm-popup-wrap' }).openPopup();
  try {
    const res = await fetch(`${API_BASE}/api/images/random?limit=1`);
    const json = await res.json();
    const item = json?.data?.[0];
    const img = item?.url ? `<img class="popup-img" src="${item.url}" alt="${safe(item.title || name)}" />` : `<div class="popup-img-fallback">🗺</div>`;
    const desc = item?.description || item?.title || 'An uncharted wonder awaits the brave.';
    html = `<div class="tm-popup"><div class="tm-popup-title">⚜ ${safe(name)}</div>${img}<p class="tm-popup-desc">"${safe(desc)}"</p></div>`;
  } catch {
    html = `<div class="tm-popup"><div class="tm-popup-title">⚜ ${safe(name)}</div><div class="popup-img-fallback">🗺</div><p class="tm-popup-desc">The archives are silent of this land.</p></div>`;
  }
  lyr.bindPopup(html, { maxWidth: 260, className: 'tm-popup-wrap' }).openPopup();
}

export async function initMap(options: { container: HTMLElement; onCountryClick: (name: string, coords: [number, number]) => void }) {
  const { container, onCountryClick } = options;

  const map = L.map(container, { zoomControl: false, minZoom: 2, maxZoom: 7, worldCopyJump: true }).setView([20, 0], 2);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);

  // Landmarks: mountains & volcanoes with journal notes
  LANDMARKS.forEach((lm) => {
    L.marker(lm.coords, {
      icon: L.divIcon({ className: 'lm-wrap', html: landmarkHtml(lm.type, lm.label), iconSize: [240, 40], iconAnchor: [16, 20] }),
      interactive: false, keyboard: false,
    }).addTo(map);
  });

  const shipIcon = L.divIcon({
    className: 'ship-marker',
    html: `<div class="ship"><div class="mast"></div><div class="sail"></div><div class="flag"></div><div class="ship-body"></div><div class="wake"></div></div>`,
    iconSize: [70, 70], iconAnchor: [35, 35],
  });
  const shipMarker = L.marker([14.5995, 120.9842], { icon: shipIcon }).addTo(map);
  const countryList: CountryItem[] = [];

  try {
    const res = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
    const data = await res.json();
    const layer = L.geoJSON(data, {
      style: (f: any) => baseStyle(f?.properties?.ADMIN || ''),
      onEachFeature: (feature, lyr: any) => {
        const name = feature.properties.ADMIN || feature.properties.NAME || 'Unknown';
        lyr.on('mouseover', function (this: any) { this.setStyle({ fillColor: '#d8c07a', fillOpacity: 0.85, weight: 2 }); });
        lyr.on('mouseout', function (this: any) { lyr.setStyle(baseStyle(name)); });
        lyr.on('click', () => {
          const c = lyr.getBounds().getCenter();
          onCountryClick(name, [c.lat, c.lng]);
          openArchivePopup(lyr, name);
        });
        countryList.push({ name, onClick: () => { const c = lyr.getBounds().getCenter(); onCountryClick(name, [c.lat, c.lng]); map.fitBounds(lyr.getBounds()); } });
      },
    }).addTo(map);
    layer.bringToFront();
  } catch (e) { console.error(e); }

  return { map, countryList, shipMarker };
}

export function sailTo(map: LeafletMap, destination: [number, number], shipMarker: Marker, onProgress: (p: number) => void, onComplete: () => void) {
  const s = shipMarker.getLatLng();
  const start: [number, number] = [s.lat, s.lng];
  const points: [number, number][] = [];
  for (let i = 0; i <= 80; i++) points.push(interpolate(start, destination, i / 80));

  L.polyline(points, { color: '#5d3a16', weight: 3, opacity: 0.85, dashArray: '8 12' }).addTo(map);
  L.marker(destination, { icon: L.divIcon({ className: '', html: '<div class="destination-marker"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(map);

  let progress = 0;
  const animate = () => {
    progress += 0.012;
    if (progress > 1) { shipMarker.setLatLng(destination); onComplete(); return; }
    shipMarker.setLatLng(interpolate(start, destination, progress));
    onProgress(progress * 100);
    requestAnimationFrame(animate);
  };
  animate();
}

function interpolate(start: [number, number], end: [number, number], f: number): [number, number] {
  const lat1 = start[0] * Math.PI / 180, lon1 = start[1] * Math.PI / 180;
  const lat2 = end[0] * Math.PI / 180, lon2 = end[1] * Math.PI / 180;
  const d = 2 * Math.asin(Math.sqrt(Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2));
  if (d === 0) return start;
  const A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);
  return [Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI, Math.atan2(y, x) * 180 / Math.PI];
}
