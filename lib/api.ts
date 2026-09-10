const API_BASE = 'https://media-api.markmykevin.workers.dev/';

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
}

/* Pull a total count from ANY response shape the API might use */
function extractTotal(json: any): number | null {
  if (!json || typeof json !== 'object') return null;
  const candidates: any[] = [
    json?.meta?.total, json?.total, json?.count,
    json?.pagination?.total, json?.data?.total, json?.data?.count,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  for (const key of ['data', 'images', 'videos', 'results', 'items']) {
    const v = json?.[key];
    if (Array.isArray(v)) return v.length;
  }
  return null;
}

async function tryFetch(url: string): Promise<any | null> {
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/* Try several endpoint shapes so the manifest NEVER reads zero/offline */
export async function getStatsResilient(): Promise<Stats> {
  let photos: number | null = null;
  let videos: number | null = null;
  let online = false;

  for (const u of [
    `${API_BASE}/api/images?page=1&pageSize=1`,
    `${API_BASE}/api/images?limit=1`,
    `${API_BASE}/api/images`,
  ]) {
    const j = await tryFetch(u);
    if (j) { online = true; const t = extractTotal(j); if (t != null) { photos = t; break; } }
  }
  if (photos == null) {
    const j = await tryFetch(`${API_BASE}/api/images/random?limit=6`);
    if (j) { online = true; const t = extractTotal(j); if (t != null) photos = t; }
  }

  for (const u of [
    `${API_BASE}/api/videos?page=1&pageSize=1`,
    `${API_BASE}/api/videos?limit=1`,
    `${API_BASE}/api/videos`,
  ]) {
    const j = await tryFetch(u);
    if (j) { online = true; const t = extractTotal(j); if (t != null) { videos = t; break; } }
  }
  if (videos == null) {
    const j = await tryFetch(`${API_BASE}/api/videos/random?limit=3`);
    if (j) { online = true; const t = extractTotal(j); if (t != null) videos = t; }
  }

  const total = photos != null && videos != null ? photos + videos : (photos ?? videos);
  return { photos, videos, total, apiOnline: online };
}

export async function getRandomMemories(): Promise<MediaItem[]> {
  const pick = (arr: any[], type: 'image' | 'video') => arr.map((i: any) => ({ ...i, mediaType: type }));
  let images: any[] = [];
  let videos: any[] = [];

  const ij = await tryFetch(`${API_BASE}/api/images/random?limit=6`);
  if (ij && Array.isArray(ij.data)) images = pick(ij.data, 'image');
  else {
    const ij2 = await tryFetch(`${API_BASE}/api/images?page=1&pageSize=6`);
    if (ij2 && Array.isArray(ij2.data)) images = pick(ij2.data, 'image');
  }

  const vj = await tryFetch(`${API_BASE}/api/videos/random?limit=3`);
  if (vj && Array.isArray(vj.data)) videos = pick(vj.data, 'video');
  else {
    const vj2 = await tryFetch(`${API_BASE}/api/videos?page=1&pageSize=3`);
    if (vj2 && Array.isArray(vj2.data)) videos = pick(vj2.data, 'video');
  }

  return [...images, ...videos].sort(() => Math.random() - 0.5);
}
