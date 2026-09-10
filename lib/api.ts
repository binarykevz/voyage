const REMOTE = 'https://media-api.markmykevin.workers.dev';
const PROXY = '/api/archive'; // same-origin → immune to CORS

export interface MediaItem {
  id?: string;
  url: string;
  title?: string;
  description?: string;
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
  source: 'proxy' | 'direct' | 'demo';
}

/* The API returns `type`, older code expected `mediaType` — accept both */
function normalize(item: any, fallback: 'image' | 'video'): MediaItem {
  const t = item?.mediaType || item?.type;
  return {
    ...item,
    mediaType: t === 'video' ? 'video' : t === 'image' ? 'image' : fallback,
  };
}

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

function totalOf(j: any): number | null {
  const c = [j?.meta?.total, j?.total, j?.count];
  for (const v of c) { const n = Number(v); if (Number.isFinite(n)) return n; }
  return Array.isArray(j?.data) ? j.data.length : null;
}

/* ---------- STATS ---------- */
export async function getStatsResilient(): Promise<Stats> {
  let photos: number | null = null;
  let videos: number | null = null;
  let online = false;
  let source: Stats['source'] = 'demo';

  const imgUrls = [
    `${PROXY}/images?page=1&pageSize=1`,
    `${REMOTE}/api/images?page=1&pageSize=1`,
  ];
  for (const u of imgUrls) {
    const j = await getJson(u);
    if (j?.success || j?.data) {
      online = true;
      source = u.startsWith(PROXY) ? 'proxy' : 'direct';
      photos = totalOf(j);
      break;
    }
  }

  const vidUrls = [
    `${PROXY}/videos?page=1&pageSize=1`,
    `${REMOTE}/api/videos?page=1&pageSize=1`,
  ];
  for (const u of vidUrls) {
    const j = await getJson(u);
    if (j?.success || j?.data) {
      online = true;
      if (source === 'demo') source = u.startsWith(PROXY) ? 'proxy' : 'direct';
      videos = totalOf(j); // 0 is a VALID answer (no videos uploaded yet)
      break;
    }
  }

  const total = photos != null && videos != null ? photos + videos : (photos ?? videos);
  return { photos, videos, total, apiOnline: online, source };
}

/* ---------- MEDIA LISTS ---------- */
export async function fetchImages(limit = 6): Promise<{ items: MediaItem[]; source: string }> {
  const attempts = [
    `${PROXY}/images/random?limit=${limit}`,
    `${REMOTE}/api/images/random?limit=${limit}`,
    `${PROXY}/images?page=1&pageSize=${limit}`,
    `${REMOTE}/api/images?page=1&pageSize=${limit}`,
  ];
  for (const u of attempts) {
    const j = await getJson(u);
    if (j && Array.isArray(j.data) && j.data.length) {
      return { items: j.data.map((d: any) => normalize(d, 'image')), source: u.startsWith(PROXY) ? 'proxy' : 'direct' };
    }
  }
  return { items: DEMO, source: 'demo' };
}

export async function fetchVideos(limit = 3): Promise<{ items: MediaItem[]; source: string }> {
  const attempts = [
    `${PROXY}/videos/random?limit=${limit}`,
    `${REMOTE}/api/videos/random?limit=${limit}`,
    `${PROXY}/videos?page=1&pageSize=${limit}`,
    `${REMOTE}/api/videos?page=1&pageSize=${limit}`,
  ];
  for (const u of attempts) {
    const j = await getJson(u);
    if (j && Array.isArray(j.data) && j.data.length) {
      return { items: j.data.map((d: any) => normalize(d, 'video')), source: u.startsWith(PROXY) ? 'proxy' : 'direct' };
    }
  }
  return { items: [], source: 'none' }; // zero videos is normal
}

export async function getRandomMemories(): Promise<{ items: MediaItem[]; source: string }> {
  const [img, vid] = await Promise.all([fetchImages(6), fetchVideos(3)]);
  return { items: [...img.items, ...vid.items].sort(() => Math.random() - 0.5), source: img.source };
}

/* ---------- SINGLE IMAGE CACHE (for map popups) ---------- */
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
