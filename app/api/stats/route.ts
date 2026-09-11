export const runtime = 'edge';

const API_BASE = 'https://media-api.markmykevin.workers.dev';
// Server-only secret. Optionally override with env var ARCHIVE_API_KEY in your hosting dashboard.
const API_KEY = process.env.ARCHIVE_API_KEY || 'e6a4ccaf5983d19197c27bf4a3a5df1a';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params; // Next 15: params is a Promise
  const url = new URL(req.url);
  const target = `${API_BASE}/api/${path.join('/')}${url.search}`;

  try {
    const res = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'x-api-key': API_KEY, // 🔑 injected here, never in the browser
      },
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
      JSON.stringify({ success: false, error: String(e?.message || e) }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
