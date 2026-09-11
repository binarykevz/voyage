const PROXY = '/api/archive'; // Same-origin proxy route

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

/* Core fetcher handling the dynamic ?country= query */
async function fetchMedia(query = ''): Promise<MediaItem[] | null> {
  const j = await getJson(`${PROXY}/media${query}`);
  
  // The API returns { data: [...] } based on your snippet
  if (j && Array.isArray(j.data)) return j.data.map(normalize);
  if (Array.isArray(j)) return j.map(normalize);
  return null;
}

/* Fetches media specifically for a clicked country */
export async function fetchCountryMedia(country: string): Promise<MediaItem[]> {
  const encoded = encodeURIComponent(country);
  const list = await fetchMedia(`?country=${encoded}`);
  return list ?? [];
}

/* Stats for the manifest */
export async function getStatsResilient(): Promise<Stats> {
  const all = await fetchMedia(); // Fetches everything without country filter
  if (all) {
    const photos = all.filter((i) => i.mediaType === 'image').length;
    const videos = all.filter((i) => i.mediaType === 'video').length;
    return { photos, videos, total: all.length, apiOnline: true, source: 'proxy' };
  }
  return { photos: null, videos: null, total: null, apiOnline: false, source: 'demo' };
}

/* General random memories for the journal grid */
export async function getRandomMemories(): Promise<{ items: MediaItem[]; source: string }> {
  const all = await fetchMedia();
  if (all && all.length) {
    const imgs = shuffle(all.filter((i) => i.mediaType === 'image' && i.url)).slice(0, 6);
    const vids = shuffle(all.filter((i) => i.mediaType === 'video' && i.url)).slice(0, 3);
    return { items: shuffle([...imgs, ...vids]), source: 'proxy' };
  }
  return { items: DEMO, source: 'demo' };
}

/* Country-specific image for map popups */
export async function getCountryArchiveImage(country: string): Promise<MediaItem | null> {
  const list = await fetchCountryMedia(country);
  const pick = list.find((i) => i.mediaType === 'image' && i.url) || list.find((i) => i.url);
  if (pick) return pick;
  
  // Fallback: if that specific country has no media, grab a random one from the general pool
  const all = await fetchMedia();
  if (all && all.length) return shuffle(all)[0];
  return null;
}

export function prewarmArchive() { /* Kept for mapUtils compatibility */ }
