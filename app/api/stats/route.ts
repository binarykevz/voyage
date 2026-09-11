export const runtime = 'edge';

/* Secrets come ONLY from environment variables (server-side). */
function archiveConfig() {
  const base = (process.env.ARCHIVE_API_BASE || '').replace(/\/+$/, '');
  const key = process.env.ARCHIVE_API_KEY || '';
  return { base, key };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params; // Next 15: params is a Promise
  const { base, key } = archiveConfig();

  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  };

  if (!base || !key) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server misconfiguration: set ARCHIVE_API_BASE and ARCHIVE_API_KEY environment variables in your hosting dashboard.',
      }),
      { status: 500, headers: jsonHeaders }
    );
  }

  const url = new URL(req.url);
  const target = `${base}/api/${path.join('/')}${url.search}`;

  try {
    const res = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'x-api-key': key, // 🔑 injected server-side only
      },
      cache: 'no-store',
    });
    const body = await res.text();
    return new Response(body, { status: res.status, headers: jsonHeaders });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: String(e?.message || e) }),
      { status: 502, headers: jsonHeaders }
    );
  }
}
