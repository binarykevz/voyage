import L from 'leaflet';
import type { Map as LeafletMap, Marker } from 'leaflet';

const API_BASE = 'https://media-api.markmykevin.workers.dev/';

export interface CountryItem { name: string; onClick: () => void; }
interface Feature { type: string; coords: [number, number]; label?: string; desc?: string; }

/* ============ ORNATE COMPASS ROSE (SVG) ============ */
const ROSE_SVG = `<svg class="oi" viewBox="0 0 100 100" width="86" height="86"><g stroke="#4a3018" fill="none" stroke-width="1"><circle cx="50" cy="50" r="46" opacity=".85"/><circle cx="50" cy="50" r="34" opacity=".6"/><circle cx="50" cy="50" r="6"/><g fill="#4a3018" fill-opacity=".85" stroke="none"><path d="M50 4 L55 45 L50 50 L45 45 Z"/><path d="M50 96 L55 55 L50 50 L45 55 Z" fill-opacity=".55"/><path d="M4 50 L45 45 L50 50 L45 55 Z" fill-opacity=".55"/><path d="M96 50 L55 45 L50 50 L55 55 Z" fill-opacity=".55"/><path d="M18 18 L46 46 L50 50 L44 44 Z" fill-opacity=".4"/><path d="M82 18 L54 46 L50 50 L56 44 Z" fill-opacity=".4"/><path d="M18 82 L46 54 L50 50 L44 56 Z" fill-opacity=".4"/><path d="M82 82 L54 54 L50 50 L56 56 Z" fill-opacity=".4"/></g><path d="M50 10 V18 M50 82 V90 M10 50 H18 M82 50 H90" stroke-width="1.2"/><text x="50" y="13" text-anchor="middle" font-size="10" fill="#4a3018" font-family="Cinzel,serif" stroke="none">N</text></g></svg>`;

/* ============ ENGRAVED ICONS ============ */
const ICONS: Record<string, string> = {
  mountain: `<svg class="oi" viewBox="0 0 72 36" width="72" height="36"><g fill="none" stroke="#4a3018" stroke-width="1.6" stroke-linecap="round"><path d="M4 32 L20 8 L30 32"/><path d="M24 32 L40 4 L56 32"/><path d="M48 32 L60 14 L68 32"/><path d="M20 8 L24 14 L18 16" opacity=".7"/><path d="M40 4 L45 12 L38 14" opacity=".7"/><path d="M22 14 L26 22 M26 12 L31 24 M42 10 L47 22 M46 12 L51 26" stroke-width="1" opacity=".55"/><path d="M2 32 H70" stroke-width="1.2" opacity=".8"/></g></svg>`,
  volcano: `<svg class="oi" viewBox="0 0 56 46" width="56" height="46"><g fill="none" stroke="#4a3018" stroke-width="1.6" stroke-linecap="round"><path d="M6 42 L22 14 H34 L50 42 Z"/><path d="M22 14 C24 10 32 10 34 14"/><path d="M25 20 L28 27 M31 18 L29 27 M28 29 L29 37" stroke="#8a3b1e" stroke-width="1.3" opacity=".85"/><path d="M12 42 L18 30 M44 42 L38 30" stroke-width="1" opacity=".5"/></g><circle class="vk-puff" cx="26" cy="7" r="3" fill="rgba(120,110,100,.5)"/><circle class="vk-puff" cx="32" cy="4" r="2.4" fill="rgba(120,110,100,.4)" style="animation-delay:1.2s"/></svg>`,
  forest: `<svg class="oi" viewBox="0 0 72 36" width="72" height="36"><g fill="none" stroke="#44502a" stroke-width="1.5" stroke-linecap="round"><path d="M10 30 V22 M10 22 L4 24 L10 14 L16 24 Z M10 14 L6 16 L10 8 L14 16 Z"/><path d="M26 30 V20 M26 20 L19 23 L26 11 L33 23 Z M26 11 L21 14 L26 5 L31 14 Z"/><path d="M44 30 V22"/><circle cx="44" cy="16" r="7"/><path d="M60 30 V24"/><circle cx="60" cy="18" r="6"/><path d="M2 32 H70" stroke-width="1.1" opacity=".7"/></g></svg>`,
  desert: `<svg class="oi" viewBox="0 0 64 24" width="64" height="24"><g fill="none" stroke="#6b4a22" stroke-width="1.4" stroke-linecap="round"><path d="M2 18 C10 10 18 10 26 18 C34 10 42 10 50 18 C56 12 60 12 62 16"/><path d="M8 22 C14 17 20 17 26 22 M34 22 C40 17 46 17 52 22" opacity=".7"/><circle cx="14" cy="6" r=".9" fill="#6b4a22"/><circle cx="40" cy="5" r=".9" fill="#6b4a22"/></g></svg>`,
  swamp: `<svg class="oi" viewBox="0 0 48 24" width="48" height="24"><g fill="none" stroke="#44502a" stroke-width="1.4" stroke-linecap="round"><path d="M4 19 H44" opacity=".7"/><path d="M10 18 V10 M10 12 L6 8 M10 12 L14 8 M10 10 V4"/><path d="M24 18 V12 M24 14 L20 10 M24 14 L28 10"/><path d="M36 18 V9 M36 12 L32 8 M36 12 L40 8"/></g></svg>`,
  serpent: `<svg class="oi" viewBox="0 0 84 28" width="84" height="28"><g fill="none" stroke="#2e4a4a" stroke-width="1.8" stroke-linecap="round"><path d="M4 20 C12 8 20 8 26 18 C32 8 40 8 46 18 C52 8 60 8 66 18"/><path d="M66 18 C70 12 76 12 78 16 C76 18 72 18 70 20"/><circle cx="76" cy="14" r="1.2" fill="#2e4a4a"/><path d="M10 23 C16 19 22 19 28 23 M36 23 C42 19 48 19 54 23" stroke-width="1" opacity=".6"/></g></svg>`,
   whale: `<svg class="oi" viewBox="0 0 64 28" width="64" height="28"><g fill="none" stroke="#2e4a4a" stroke-width="1.6" stroke-linecap="round"><path d="M6 18 C14 8 34 6 46 12 C52 15 56 15 60 12 C58 18 52 20 46 19 C34 22 14 22 6 18 Z"/><path class="wh-spout" d="M20 8 C20 4 22 3 22 0 M26 8 C26 5 28 4 28 2" opacity=".8"/><circle cx="14" cy="15" r="1" fill="#2e4a4a"/></g></svg>`,
  wave: `<svg class="oi" viewBox="0 0 40 12" width="40" height="12"><path d="M2 8 C6 3 10 3 14 8 C18 3 22 3 26 8 C30 3 34 3 38 8" fill="none" stroke="#3d5a66" stroke-width="1.2" opacity=".55"/></svg>`,
  sink: `<svg class="oi" viewBox="0 0 40 32" width="40" height="32"><g fill="none" stroke="#4a3018" stroke-width="1.5" stroke-linecap="round"><path d="M6 22 L30 16 L26 26 L10 28 Z" transform="rotate(-12 20 22)"/><path d="M18 14 V4 M18 6 L26 8 L18 11"/><path d="M4 30 C8 27 12 27 16 30 M22 30 C26 27 30 27 34 30" opacity=".6"/></g></svg>`,
};

const LANDMARKS: Feature[] = [
  { type: 'volcano', coords: [37.75, 14.99], label: 'Mons Aetna', desc: 'Thrice this century it woke, spilling fire upon the Sicilian night.' },
  { type: 'volcano', coords: [35.36, 138.73], label: 'Fusi Yama', desc: 'A perfect cone of silence. Pilgrims climb at dawn to greet the sun.' },
  { type: 'volcano', coords: [-6.1, 105.42], label: 'Cracatoa', desc: 'The isle that tore itself asunder. The sea still remembers the roar.' },
  { type: 'volcano', coords: [63.63, -19.62], label: 'Yma Fire', desc: 'Ice above, fire below. When it speaks, the northern skies close like a door.' },
  { type: 'mountain', coords: [46.5, 9.8], label: 'Montes Alpi', desc: 'The wall between worlds. Hannibal\u2019s elephants bled upon these passes.' },
  { type: 'mountain', coords: [28.0, 86.9], label: 'Himalaya', desc: 'The roof of the world. Prayers freeze mid-air in the thin wind.' },
  { type: 'mountain', coords: [-32.6, -70.1], label: 'Cordillera', desc: 'A spine of stone running the length of a continent.' },
  { type: 'mountain', coords: [39.5, -105.8], label: 'Montes Robusti', desc: 'Blue walls of the wild west; outlaws hide in their folds.' },
  { type: 'mountain', coords: [31.06, -7.9], label: 'Atlas', desc: 'Old Atlas bows here, holding the sky from the sand.' },
  { type: 'forest', coords: [-3.5, -62.0], label: 'Silva Umbra', desc: 'A green ocean that breathes; rivers wander it like lost veins.' },
  { type: 'forest', coords: [48.0, 8.2], label: 'Silva Nigra', desc: 'Dark pines where the sun enters only by permission.' },
  { type: 'forest', coords: [60.0, 90.0], label: 'Taiga', desc: 'An endless wood of frost beneath the burning aurora.' },
  { type: 'forest', coords: [0.5, 114.0], label: 'Borneo', desc: 'Vines like ship ropes, birds like flames.' },
  { type: 'desert', coords: [23.0, 12.0], label: 'Sahara', desc: 'Dunes that walk with the wind; caravans follow stars and bones.' },
  { type: 'desert', coords: [43.0, 105.0], label: 'Gobi', desc: 'A cold desert of whispering dust and dragon bones.' },
  { type: 'desert', coords: [-24.0, -69.0], label: 'Atacama', desc: 'The driest place on Earth. Rain here is a rumor.' },
  { type: 'swamp', coords: [-19.5, 22.5], label: 'Okavango', desc: 'A river that never finds the sea, blooming into reeds and hippos.' },
];

const OCEANICA: Feature[] = [
  { type: 'serpent', coords: [45, -40], label: 'Mare Serpentis', desc: 'A coil of black scale longer than the mainmast, say the crews.' },
  { type: 'whale', coords: [-45, 90], label: 'Leviathan', desc: 'The gentle leviathan; its song carries leagues beneath the keel.' },
  { type: 'whale', coords: [10, -140], label: 'Great Whale Road', desc: 'Here the whales migrate in silver lines toward the southern ice.' },
  { type: 'sink', coords: [26, -70], label: 'Triangulum Fatalis', desc: 'Compasses spin, ships vanish, and the sea gives back only silence.' },
  { type: 'wave', coords: [10, -120] }, { type: 'wave', coords: [-10, -100] },
  { type: 'wave', coords: [30, -40] }, { type: 'wave', coords: [-30, -20] },
  { type: 'wave', coords: [0, 70] }, { type: 'wave', coords: [-40, 140] },
  { type: 'wave', coords: [20, 60] }, { type: 'wave', coords: [50, -130] }, { type: 'wave', coords: [-20, 100] },
];

const CURRENTS: { points: [number, number][]; label?: string; at?: [number, number] }[] = [
  { points: [[25, -80], [30, -75], [35, -60], [40, -45], [45, -30], [50, -20]], label: 'Currus Magna — the great warm current', at: [38, -50] },
  { points: [[20, 122], [25, 135], [30, 150], [35, 165], [40, 175]], label: 'Kuroshio — the black tide', at: [33, 152] },
  { points: [[-45, -75], [-30, -72], [-15, -75], [-5, -80]], label: 'Humboldt — the cold bearer', at: [-25, -78] },
  { points: [[-52, -60], [-54, 0], [-52, 60], [-54, 120], [-52, 178]], label: 'Circulus Antarcticus — the endless ring', at: [-56, 60] },
];

const VOYAGE_ROUTE: [number, number][] = [
  [36, -6], [28, -17], [5, -25], [-15, -35], [-34, -56], [-40, -68], [-35, -80], [-15, -95],
  [0, -115], [10, -140], [5, 145], [-5, 120], [-10, 95], [-12, 60], [-10, 40], [5, 10], [15, -5], [36, -6],
];

const TERRA: [number, number, string][] = [
  [-15, -130, 'Mare Pacificum'], [12, -38, 'Mare Atlanticum'], [-25, 82, 'Oceanus Indicus'],
  [-62, 95, 'Terra Australis Incognita'], [55, -140, 'Mare Septentrionale'],
];

const BERMUDA: [number, number][] = [[25, -80], [32, -64], [18, -65]];

/* ============ IMAGE API ============ */
let archiveCache: any[] = [];
async function refillCache() {
  try {
    const r = await fetch(`${API_BASE}/api/images/random?limit=4`, { headers: { Accept: 'application/json' } });
    if (!r.ok) return;
    const j = await r.json();
    if (j?.success && Array.isArray(j.data)) archiveCache.push(...j.data.filter((d: any) => d?.url && String(d.url).startsWith('http')));
  } catch {}
}
async function getArchiveImage(): Promise<any | null> {
  if (!archiveCache.length) await refillCache();
  if (!archiveCache.length) await refillCache();
  return archiveCache.shift() || null;
}
const safe = (s: any) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));

function autoClose(layer: any, ms: number) {
  const p = layer.getPopup();
  setTimeout(() => { try { if (layer.getPopup() === p && layer.isPopupOpen && layer.isPopupOpen()) layer.closePopup(); } catch {} }, ms);
}

async function openArchivePopup(lyr: any, name: string) {
  lyr.bindPopup(`<div class="tm-popup"><div class="tm-popup-title">⚜ ${safe(name)}</div><div class="popup-img-fallback">🕰</div><p class="tm-popup-desc">Consulting the archives…</p></div>`, { maxWidth: 260, className: 'tm-popup-wrap' }).openPopup();
  const item = await getArchiveImage();
  const img = item?.url ? `<img class="popup-img" src="${item.url}" alt="${safe(item.title || name)}" onerror="this.outerHTML='<div class=&quot;popup-img-fallback&quot;>🗺</div>'" />` : `<div class="popup-img-fallback">🗺</div>`;
  const desc = item?.description || item?.title || 'The archives are silent of this land.';
  lyr.bindPopup(`<div class="tm-popup"><div class="tm-popup-title">⚜ ${safe(name)}</div>${img}<p class="tm-popup-desc">"${safe(desc)}"</p></div>`, { maxWidth: 260, className: 'tm-popup-wrap' }).openPopup();
  autoClose(lyr, 5000);
}

/* ============ CLICK RIPPLE ============ */
function spawnRipple(map: LeafletMap, latlng: [number, number], kind: 'gold' | 'sea') {
  const m = L.marker(latlng, {
    icon: L.divIcon({ className: 'ripple-wrap', html: `<span class="ripple-ring ${kind}"></span><span class="ripple-ring ${kind} r2"></span>`, iconSize: [0, 0] }),
    interactive: false, keyboard: false,
  }).addTo(map);
  setTimeout(() => m.remove(), 1200);
}

/* ============ CHART LAYERS ============ */
function addGraticule(map: LeafletMap) {
  for (let lat = -60; lat <= 75; lat += 15) L.polyline([[lat, -180], [lat, 180]], { className: 'graticule', interactive: false }).addTo(map);
  for (let lng = -160; lng <= 160; lng += 20) L.polyline([[-75, lng], [80, lng]], { className: 'graticule', interactive: false }).addTo(map);
  const specials: [number, string][] = [[0, 'Circulus Equinoctialis'], [23.4, 'Tropicus Cancri'], [-23.4, 'Tropicus Capricorni'], [66.5, 'Circulus Arcticus'], [-66.5, 'Circulus Antarcticus']];
  specials.forEach(([lat, name]) => {
    L.polyline([[lat, -180], [lat, 180]], { className: 'graticule-special', interactive: false }).addTo(map);
    L.marker([lat + 1.2, -176], { icon: L.divIcon({ className: 'lm-wrap', html: `<span class="deg-label special">${name}</span>`, iconSize: [170, 14], iconAnchor: [0, 7] }), interactive: false }).addTo(map);
  });
  for (let lat = -60; lat <= 60; lat += 30) if (lat !== 0) L.marker([lat, -178], { icon: L.divIcon({ className: 'lm-wrap', html: `<span class="deg-label">${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}</span>`, iconSize: [34, 12], iconAnchor: [0, 6] }), interactive: false }).addTo(map);
  for (let lng = -150; lng <= 150; lng += 50) L.marker([76, lng], { icon: L.divIcon({ className: 'lm-wrap', html: `<span class="deg-label">${Math.abs(lng)}°${lng >= 0 ? 'E' : 'W'}</span>`, iconSize: [34, 12], iconAnchor: [17, 12] }), interactive: false }).addTo(map);
}

function addRhumbRoses(map: LeafletMap) {
  const centers: [number, number][] = [[30, -40], [-25, 80], [10, -150]];
  const windNames = ['Tramontana', 'Greco', 'Levante', 'Scirocco', 'Ostro', 'Libeccio', 'Ponente', 'Maestro'];
  
  centers.forEach((c) => {
    for (let k = 0; k < 16; k++) {
      const a = (k * 22.5 * Math.PI) / 180;
      const lat = Math.max(-80, Math.min(82, c[0] + Math.cos(a) * 55));
      const lng = c[1] + Math.sin(a) * 88;
      L.polyline([c, [lat, lng]], { className: 'rhumb', interactive: false }).addTo(map);
      
      // Add wind direction labels at 45° intervals
      if (k % 2 === 0 && windNames[k / 2]) {
        const labelLat = c[0] + Math.cos(a) * 38;
        const labelLng = c[1] + Math.sin(a) * 58;
        L.marker([labelLat, labelLng], {
          icon: L.divIcon({
            className: 'lm-wrap',
            html: `<span class="wind-label">${windNames[k / 2]}</span>`,
            iconSize: [80, 14],
            iconAnchor: [40, 7]
          }),
          interactive: false
        }).addTo(map);
      }
    }
    
    const rose = L.marker(c, {
      icon: L.divIcon({
        className: 'lm-wrap rose-wrap',
        html: ROSE_SVG,
        iconSize: [86, 86],
        iconAnchor: [43, 43]
      }),
      interactive: true,
      keyboard: false
    }).addTo(map);
    
    rose.on('click', (e: any) => {
      if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
      const el = rose.getElement() as HTMLElement | undefined;
      if (el) {
        el.classList.remove('rose-spin');
        void el.offsetWidth;
        el.classList.add('rose-spin');
        setTimeout(() => el.classList.remove('rose-spin'), 1500);
      }
      spawnRipple(map, c, 'gold');
    });
  });
}

/* ============ HELPERS ============ */
function hashName(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function baseStyle(name: string) {
  const green = hashName(name) % 2 === 0;
  return { color: '#5d4a26', weight: 1, fillColor: green ? '#8f9e7b' : '#a8916b', fillOpacity: 0.55 };
}
function featureIcon(type: string, label?: string) {
  const ocean = type === 'serpent' || type === 'whale' || type === 'wave';
  return `<div class="lm lm-${type}">${ICONS[type]}${label ? `<span class="lm-label ${ocean ? 'ocean' : ''}">${label}</span>` : ''}</div>`;
}

/* ============ MAP INIT ============ */
export async function initMap(options: { container: HTMLElement; onCountryClick: (name: string, coords: [number, number]) => void }) {
  const { container, onCountryClick } = options;
  refillCache();

  const map = L.map(container, { zoomControl: false, minZoom: 2, maxZoom: 7, worldCopyJump: true }).setView([20, 0], 2);
  L.control.zoom({ position: 'topleft' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);

  addGraticule(map);
  addRhumbRoses(map);
  L.polyline(VOYAGE_ROUTE, { className: 'voyage-route', interactive: false }).addTo(map);
  L.marker([-46, -95], { icon: L.divIcon({ className: 'lm-wrap', html: `<span class="lm-label ocean">Via Primae Circumnavigationis — Anno 1519</span>`, iconSize: [260, 16], iconAnchor: [0, 8] }), interactive: false }).addTo(map);
  TERRA.forEach(([lat, lng, text]) => L.marker([lat, lng], { icon: L.divIcon({ className: 'lm-wrap', html: `<span class="terra-label">${text}</span>`, iconSize: [240, 20], iconAnchor: [120, 10] }), interactive: false }).addTo(map));

  CURRENTS.forEach((c) => {
    L.polyline(c.points, { className: 'current' }).addTo(map);
    if (c.label && c.at) L.marker(c.at, { icon: L.divIcon({ className: 'lm-wrap', html: `<span class="lm-label ocean">${c.label}</span>`, iconSize: [220, 24], iconAnchor: [0, 12] }), interactive: false }).addTo(map);
  });

  L.polygon(BERMUDA, { className: 'bm-tri', color: '#8a3b1e', weight: 2, dashArray: '6 6', fillColor: '#8a3b1e', fillOpacity: 0.08 }).addTo(map);

  [...LANDMARKS, ...OCEANICA].forEach((f) => {
    const clickable = f.type !== 'wave';
    const marker = L.marker(f.coords, {
      icon: L.divIcon({ className: 'lm-wrap', html: featureIcon(f.type, f.label), iconSize: [250, 48], iconAnchor: [24, 24] }),
      interactive: clickable, keyboard: clickable,
    }).addTo(map);
    if (clickable) {
      marker.on('click', (e: any) => {
        if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
        const el = marker.getElement() as HTMLElement | undefined;
        if (el) { el.classList.remove('lm-boom'); void el.offsetWidth; el.classList.add('lm-boom'); setTimeout(() => el.classList.remove('lm-boom'), 1300); }
        spawnRipple(map, f.coords, 'gold');
        marker.bindPopup(`<div class="tm-popup"><div class="tm-popup-title">✦ ${safe(f.label || 'Terra Incognita')}</div><p class="tm-popup-desc">"${safe(f.desc || 'An unmarked wonder of the old world.')}"</p></div>`, { maxWidth: 240, className: 'tm-popup-wrap', offset: [0, -8] }).openPopup();
        autoClose(marker, 4000);
      });
    }
  });

  // Ocean click ripple
  map.on('click', (e) => spawnRipple(map, [e.latlng.lat, e.latlng.lng], 'sea'));

  const shipIcon = L.divIcon({ className: 'ship-marker', html: `<div class="ship"><div class="mast"></div><div class="sail"></div><div class="flag"></div><div class="ship-body"></div><div class="wake"></div></div>`, iconSize: [70, 70], iconAnchor: [35, 35] });
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
        lyr.on('click', (e: any) => {
          if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
          const c = lyr.getBounds().getCenter();
          spawnRipple(map, [e.latlng.lat, e.latlng.lng], 'gold');
          lyr.setStyle({ fillColor: '#f0d488', fillOpacity: 0.95, weight: 3 }); // flash
          setTimeout(() => lyr.setStyle(baseStyle(name)), 450);
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

/* ============ SAILING ============ */
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
