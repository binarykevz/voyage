import type { Map as LeafletMap } from 'leaflet';

export interface CountryItem {
  name: string;
  onClick: () => void;
}

export async function initMap(options: { container: HTMLElement; onCountryClick: (name: string, coords: [number, number]) => void }) {
  const L = (await import('leaflet')).default;
  const { container, onCountryClick } = options;

  const map = L.map(container, { zoomControl: false, minZoom: 2, maxZoom: 7, worldCopyJump: true }).setView([20, 0], 2);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);

  const shipIcon = L.divIcon({
    className: 'ship-marker',
    html: `<div class="ship"><div class="mast"></div><div class="sail"></div><div class="flag"></div><div class="ship-body"></div><div class="wake"></div></div>`,
    iconSize: [70, 70], iconAnchor: [35, 35],
  });
  
  let shipMarker = L.marker([14.5995, 120.9842], { icon: shipIcon }).addTo(map);
  const countryList: CountryItem[] = [];

  try {
    const res = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
    const data = await res.json();
    const layer = L.geoJSON(data, {
      style: { color: '#65451e', weight: 1, fillColor: '#c8a86b', fillOpacity: 0.38 },
      onEachFeature: (feature, lyr: any) => {
        const name = feature.properties.ADMIN || feature.properties.NAME || 'Unknown';
        lyr.bindPopup(`<div class="popup-title">${name}</div>`);
        lyr.on('mouseover', function(this: any) { this.setStyle({ fillColor: '#e0c78c', fillOpacity: 0.75, weight: 2 }); });
        lyr.on('mouseout', function(this: any) { this.setStyle({ fillColor: '#c8a86b', fillOpacity: 0.38, weight: 1 }); });
        lyr.on('click', () => {
          const c = lyr.getBounds().getCenter();
          onCountryClick(name, [c.lat, c.lng]);
          lyr.openPopup();
        });
        countryList.push({ name, onClick: () => { const c = lyr.getBounds().getCenter(); onCountryClick(name, [c.lat, c.lng]); map.fitBounds(lyr.getBounds()); } });
      },
    }).addTo(map);
    layer.bringToFront();
  } catch (e) { console.error(e); }

  return { map, countryList, shipMarker };
}

export function sailTo(map: LeafletMap, destination: [number, number], shipMarker: any, onProgress: (p: number) => void, onComplete: () => void) {
  const start = shipMarker.getLatLng();
  const points = [];
  for (let i = 0; i <= 80; i++) points.push(interpolate([start.lat, start.lng], destination, i / 80));
  
  L.polyline(points, { color: '#5d3a16', weight: 3, opacity: 0.85, dashArray: '8 12' }).addTo(map);
  L.marker(destination, { icon: L.divIcon({ className: '', html: '<div class="destination-marker"></div>', iconSize: [22, 22] }) }).addTo(map);

  let progress = 0;
  const animate = () => {
    progress += 0.01;
    if (progress > 1) { onComplete(); return; }
    const pos = interpolate([start.lat, start.lng], destination, progress);
    shipMarker.setLatLng(pos);
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
