const PROXY = '/api/archive';
const DIRECT_API_BASE = 'https://media-api.markmykevin.workers.dev';
const DIRECT_API_KEY = 'e6a4ccaf5983d19197c27bf4a3a5df1a';

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

// Define the exact allowed strings for source
type SourceType = 'proxy' | 'direct' | 'none';

export interface Stats {
  photos: number | null;
  videos: number | null;
  total: number | null;
  apiOnline: boolean;
  source: SourceType;
  error?: string;
}

function normalize(item: any): MediaItem {
  const t = item?.mediaType || item?.type;
  const mime = String(item?.mimeType || '');
  const isVideo = t === 'video' || mime.startsWith('video');
  return { ...item, mediaType: isVideo ? 'video' : 'image' };
}

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

// Use the SourceType here so TypeScript knows exactly what it is
async function getJson(url: string, useDirectKey = false): Promise<{ data: any; error?: string; source: SourceType } | null> {
  // Attempt 1: Proxy (same-origin, no CORS issues)
  if (!useDirectKey) {
    try {
      const r = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (r.ok) {
        const j = await r.json();
        return { data: j, error: undefined, source: 'proxy' };
      }
    } catch (e: any) {
      // Proxy failed, fall through to direct
    }
  }

  // Attempt 2: Direct API call with hardcoded key (bypasses proxy)
  try {
    const directUrl = url.replace(PROXY, `${DIRECT_API_BASE}/api`);
    const r = await fetch(directUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'x-api-key': DIRECT_API_KEY,
      },
    });
    const j = await r.json();
    if (r.ok) return { data: j, error: undefined, source: 'direct' };
    return { data: null, error: j?.error || `HTTP ${r.status}`, source: 'direct' };
  } catch (e: any) {
    return null;
  }
}

async function fetchMedia(query = '', useDirectKey = false): Promise<{ items: MediaItem[] | null; error?: string; source: SourceType }> {
  const res = await getJson(`${PROXY}/media${query}`, useDirectKey);
  if (!res || !res.data) return { items: null, error: res?.error || 'Network error', source: 'none' };
  
  const arr = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
  return { items: arr.map(normalize), error: undefined, source: res.source };
}

export async function fetchCountryMedia(country: string): Promise<MediaItem[]> {
  const encoded = encodeURIComponent(country);
  const { items } = await fetchMedia(`?country=${encoded}`);
  return items ?? [];
}

export async function getStatsResilient(): Promise<Stats> {
  const { items, error, source } = await fetchMedia();
  if (items) {
    const photos = items.filter((i) => i.mediaType === 'image').length;
    const videos = items.filter((i) => i.mediaType === 'video').length;
    return { photos, videos, total: items.length, apiOnline: true, source };
  }
  return { photos: null, videos: null, total: null, apiOnline: false, source: 'none', error };
}

export async function getRandomMemories(): Promise<{ items: MediaItem[]; source: string }> {
  const { items, source } = await fetchMedia();
  if (items && items.length) {
    const imgs = shuffle(items.filter((i) => i.mediaType === 'image' && i.url)).slice(0, 6);
    const vids = shuffle(items.filter((i) => i.mediaType === 'video' && i.url)).slice(0, 3);
    return { items: shuffle([...imgs, ...vids]), source };
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
