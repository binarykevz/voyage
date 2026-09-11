const PROXY = '/api/archive';

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
  source: 'proxy' | 'none';
  error?: string;
}

function normalize(item: any): MediaItem {
  const t = item?.mediaType || item?.type;
  const mime = String(item?.mimeType || '');
  const isVideo = t === 'video' || mime.startsWith('video');
  return { ...item, mediaType: isVideo ? 'video' : 'image' };
}

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

async function getJson(url: string): Promise<{ data: any; error?: string } | null> {
  try {
    const r = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
    const j = await r.json();
    if (!r.ok) return { data: null, error: j?.error || `HTTP ${r.status}` };
    return { data: j, error: undefined };
  } catch (e: any) {
    return null;
  }
}

async function fetchMedia(query = ''): Promise<{ items: MediaItem[] | null; error?: string }> {
  const res = await getJson(`${PROXY}/media${query}`);
  if (!res || !res.data) return { items: null, error: res?.error || 'Network error' };
  
  const arr = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
  return { items: arr.map(normalize), error: undefined };
}

export async function fetchCountryMedia(country: string): Promise<MediaItem[]> {
  const encoded = encodeURIComponent(country);
  const { items } = await fetchMedia(`?country=${encoded}`);
  return items ?? [];
}

export async function getStatsResilient(): Promise<Stats> {
  const { items, error } = await fetchMedia();
  if (items) {
    const photos = items.filter((i) => i.mediaType === 'image').length;
    const videos = items.filter((i) => i.mediaType === 'video').length;
    return { photos, videos, total: items.length, apiOnline: true, source: 'proxy' };
  }
  return { photos: null, videos: null, total: null, apiOnline: false, source: 'none', error };
}

export async function getRandomMemories(): Promise<{ items: MediaItem[]; source: string }> {
  const { items } = await fetchMedia();
  if (items && items.length) {
    const imgs = shuffle(items.filter((i) => i.mediaType === 'image' && i.url)).slice(0, 6);
    const vids = shuffle(items.filter((i) => i.mediaType === 'video' && i.url)).slice(0, 3);
    return { items: shuffle([...imgs, ...vids]), source: 'proxy' };
  }
  return { items: [], source: 'none' };
}

export async function getCountryArchiveImage(country: string): Promise<MediaItem | null> {
  const list = await fetchCountryMedia(country);
  const pick = list.find((i) => i.mediaType === 'image' && i.url) || list.find((i) => i.url);
  if (pick) return pick;
  
  const { items } = await fetchMedia();
  if (items && items.length) return shuffle(items)[0];
  return null;
}

export function prewarmArchive() { /* Kept for mapUtils compatibility */ }
