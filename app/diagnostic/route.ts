export const runtime = 'edge';

export async function GET() {
  const base = process.env.ARCHIVE_API_BASE;
  const key = process.env.ARCHIVE_API_KEY;
  
  return new Response(
    JSON.stringify({
      hasBase: !!base,
      hasKey: !!key,
      baseLength: base?.length || 0,
      keyLength: key?.length || 0,
      basePreview: base ? `${base.slice(0, 10)}...` : null,
      keyPreview: key ? `${key.slice(0, 4)}...` : null,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
