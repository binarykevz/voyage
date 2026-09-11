const PROXY = '/api/archive'; // same-origin; the proxy injects the x-api-key

export interface MediaItem {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  country?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
  mediaType: 'image' | 'video';
}

export interface Stats {
  photos: number | null;
  videos: number | null;
  total: number | null;
  apiOnline: boolean;
  source: 'proxy' | 'demo';
}

function normalize(item: any): MediaItem {
  const t = item?.mediaType || item?.type;
  const mime = String(item?.mimeType || '');
  const isVideo = t === 'video' || mime.startsWith('video');
  return { ...item, mediaType: isVideo ? 'video' : 'image' };
}

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

async function getJson(url: string): Promise<any | null> {
  try {
    const r = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

const DEMO: MediaItem[] = [
  { url: 'https://picsum.photos/seed/relic1/640/480', title: 'Demo Relic I', description: 'Placeholder while the archives sleep.', mediaType: 'image', createdAt: new Date().toISOString() },
  { url: 'https://picsum.photos/seed/relic2/640/480', title: 'Demo Relic II', description: 'Placeholder while the archives sleep.', mediaType: 'image', createdAt: new Date().toISOString() },
  { url: 'https://picsum.photos/seed/relic3/640/480', title: 'Demo Relic III', description: 'Placeholder while the archives sleep.', mediaType: 'image', createdAt: new Date().toISOString() },
];

/* ---------- core fetchers (new /api/media endpoint) ---------- */
async function fetchMedia(query = ''): Promise<MediaItem[] | null> {
  const j = await getJson(`${PROXY}/media${query}`);
  if (j && Array.isArray(j.data)) return j.data.map(normalize);
  if (Array.isArray(j)) return j.map(normalize);
  return null;
}

export async function fetchCountryMedia(country: string): Promise<MediaItem[]> {
  const list = await fetchMedia(`?country=${encodeURIComponent(country)}`);
  return list ?? [];
}

/* ---------- stats ---------- */
export async function getStatsResilient(): Promise<Stats> {
  const all = await fetchMedia();
  if (all) {
    const photos = all.filter((i) => i.mediaType === 'image').length;
    const videos = all.filter((i) => i.mediaType === 'video').length;
    return { photos, videos, total: all.length, apiOnline: true, source: 'proxy' };
  }
  return { photos: null, videos: null, total: null, apiOnline: false, source: 'demo' };
}

/* ---------- lists ---------- */
export async function fetchImages(limit = 6): Promise<{ items: MediaItem[]; source: string }> {
  const all = await fetchMedia();
  if (all && all.length) {
    const imgs = shuffle(all.filter((i) => i.mediaType === 'image' && i.url)).slice(0, limit);
    if (imgs.length) return { items: imgs, source: 'proxy' };
  }
  return { items: DEMO, source: 'demo' };
}

export async function fetchVideos(limit = 3): Promise<{ items: MediaItem[]; source: string }> {
  const all = await fetchMedia();
  if (all && all.length) {
    const vids = shuffle(all.filter((i) => i.mediaType === 'video' && i.url)).slice(0, limit);
    return { items: vids, source: 'proxy' };
  }
  return { items: [], source: 'none' };
}

export async function getRandomMemories(): Promise<{ items: MediaItem[]; source: string }> {
  const [img, vid] = await Promise.all([fetchImages(6), fetchVideos(3)]);
  return { items: shuffle([...img.items, ...vid.items]), source: img.source };
}

/* ---------- cached single image (map popups) ---------- */
let cache: MediaItem[] = [];
export function prewarmArchive() { refill(); }
async function refill() {
  const { items } = await fetchImages(4);
  cache.push(...items.filter((i) => i.url && i.url.startsWith('http')));
}
export async function getArchiveImage(): Promise<MediaItem | null> {
  if (!cache.length) await refill();
  if (!cache.length) await refill();
  return cache.shift() || null;
}

/* Country-first image for popups, falling back to the general pool */
export async function getCountryArchiveImage(country: string): Promise<MediaItem | null> {
  const list = await fetchCountryMedia(country);
  const pick = list.find((i) => i.mediaType === 'image' && i.url) || list.find((i) => i.url);
  if (pick) return pick;
  return getArchiveImage();
}
