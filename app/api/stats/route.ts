export const runtime = 'edge'; // ← runs on Cloudflare Workers

import { NextResponse } from 'next/server';

const API_BASE = 'https://media-api.markmykevin.workers.dev/';

export async function GET() {
  try {
    const [imgRes, vidRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/images?page=1&pageSize=1`, {
        headers: { Accept: 'application/json' },
      }),
      fetch(`${API_BASE}/api/videos?page=1&pageSize=1`),
    ]);

    let photos = 0;
    let videos = 0;

    if (imgRes.status === 'fulfilled' && imgRes.value.ok) {
      const data = await imgRes.value.json();
      photos = data.meta?.total ?? data.data?.length ?? 0;
    }

    if (vidRes.status === 'fulfilled' && vidRes.value.ok) {
      const data = await vidRes.value.json();
      videos = data.meta?.total ?? data.data?.length ?? 0;
    }

    return NextResponse.json({
      total: photos + videos,
      photos,
      videos,
      apiOnline: photos > 0 || videos > 0,
    });
  } catch (err) {
    return NextResponse.json(
      { total: 0, photos: 0, videos: 0, apiOnline: false },
      { status: 500 }
    );
  }
}
