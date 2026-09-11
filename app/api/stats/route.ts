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

  // 🛑 Intercept diagnostic route so it doesn't proxy to the external API
  if (path[0] === 'diagnostic') {
    return new Response(
      JSON.stringify({
        hasBase: !!base,
        hasKey: !!key,
        baseLength: base?.length || 0,
        keyLength: key?.length || 0,
        basePreview: base ? `${base.slice(0, 15)}...` : null,
        keyPreview: key ? `${key.slice(0, 4)}...` : null,
      }),
      { status: 200, headers: jsonHeaders }
    );
  }

  if (!base || !key) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'MISSING_ENV_VARS',
        message: 'Set ARCHIVE_API_BASE and ARCHIVE_API_KEY in Cloudflare Pages settings, then redeploy.',
      }),
      { status: 500, headers: jsonHeaders }
    );
  }

  const url = new URL(req.url);
  const target = `${base}/api/${path.join('/')}${url.search}`;

  try {
    const res = await fetch(target, {
      headers: { Accept: 'application/json', 'x-api-key': key },
      cache: 'no-store',
    });
    const body = await res.text();
    return new Response(body, { status: res.status, headers: jsonHeaders });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: 'FETCH_FAILED', message: String(e?.message || e) }),
      { status: 502, headers: jsonHeaders }
    );
  }
}
