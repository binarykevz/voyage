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

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  meta?: { total?: number };
}

async function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getRandomMemories(): Promise<MediaItem[]> {
  const [imgRes, vidRes] = await Promise.allSettled([
    fetchJson<any>(`${API_BASE}/api/images/random?limit=6`),
    fetchJson<any>(`${API_BASE}/api/videos/random?limit=3`),
  ]);

  const images =
    imgRes.status === 'fulfilled' && imgRes.value?.success
      ? imgRes.value.data.map((i: any) => ({ ...i, mediaType: 'image' as const }))
      : [];

  const videos =
    vidRes.status === 'fulfilled' && vidRes.value?.success
      ? imgRes.value.data.map((v: any) => ({ ...v, mediaType: 'video' as const }))
      : [];

  return [...images, ...videos].sort(() => Math.random() - 0.5);
}
