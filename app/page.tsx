import Header from '../components/Header';
import MapSection from '../components/MapSection';
import JournalGrid from '../components/JournalGrid';
import LogCard from '../components/LogCard';
import Footer from '../components/Footer';
// Runs on Cloudflare Workers edge
export const runtime = 'edge';

// ISR-like revalidation (optional, works on Cloudflare)
export const revalidate = 3600;

async function getStats() {
  try {
    // Internal fetch to our own Edge route
    const res = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/stats`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch {
    return { total: '--', photos: '--', videos: '--', apiOnline: false };
  }
}

export default async function Home() {
  const stats = await getStats();

  return (
    <main className="min-h-screen relative">
      <div className="map-vignette fixed inset-0 pointer-events-none" />
      <div className="map-grain fixed inset-0 pointer-events-none" />

      <Header />
      <MapSection />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-12 pb-6 border-b-4 border-double border-ink-light/40">
          <h2 className="font-title text-3xl md:text-5xl uppercase tracking-wider text-ink-dark text-shadow-vintage">
            Voyage Manifest
          </h2>
          <p className="mt-3 text-ink-mid italic font-old text-lg">
            A registry of all treasures and captured memories from the expedition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <LogCard label="Total Treasures" value={stats.total} sub="Artifacts collected across the realm." delay={0} />
          <LogCard label="Photographs" value={stats.photos} sub="Captured moments from distant ports." delay={0.1} />
          <LogCard label="Moving Pictures" value={stats.videos} sub="Living memories of the voyage." delay={0.2} />
          <LogCard label="Archive Status" value={stats.apiOnline ? 'Online' : 'Offline'} sub="Connection to the ancient archives." delay={0.3} />
        </div>

        <div className="text-center mb-12 pb-6 border-b-4 border-double border-ink-light/40">
          <h2 className="font-title text-3xl md:text-5xl uppercase tracking-wider text-ink-dark text-shadow-vintage">
            Log Entries
          </h2>
          <p className="mt-3 text-ink-mid italic font-old text-lg max-w-3xl mx-auto">
            Each discovery appears as a weathered page — the photograph or moving picture first, followed by the explorer's handwritten notes.
          </p>
        </div>

        <JournalGrid />
      </section>
    </main>
  );
}
