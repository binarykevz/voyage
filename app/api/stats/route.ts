export const runtime = 'edge'; // ← runs on Cloudflare Workers

import { NextResponse } from 'next/server';

const API_BASE = 'https://media-api.markmykevin.workers.dev/';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params; // Next 15: params is a Promise
  const url = new URL(req.url);
  const target = `${API_BASE}/api/${path.join('/')}${url.search}`;

  try {
    const res = await fetch(target, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: String(e?.message || e), target }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
