export const runtime = 'edge';

function getArchiveConfig() {
  const base = (process.env.ARCHIVE_API_BASE || '').replace(/\/+$/, '');
  const key = process.env.ARCHIVE_API_KEY || '';
  return { base, key };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const { base, key } = getArchiveConfig();

  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  };

  if (!base || !key) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'MISSING_ENV_VARS: Set ARCHIVE_API_BASE and ARCHIVE_API_KEY in your Cloudflare/Vercel dashboard, then trigger a new deployment.',
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
        'x-api-key': key,
      },
      cache: 'no-store',
    });
    const body = await res.text();
    
    // Pass through the exact status and body (including "Unauthorized" if key is wrong)
    return new Response(body, { 
      status: res.status, 
      headers: jsonHeaders 
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: String(e?.message || e) }),
      { status: 502, headers: jsonHeaders }
    );
  }
}
