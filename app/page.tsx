import AncientLoader from '../components/AncientLoader';
import TreasureFX from '../components/TreasureFX';
import Header from '../components/Header';
import MapSection from '../components/MapSection';
import JournalGrid from '../components/JournalGrid';
import LogCard from '../components/LogCard';
import Footer from '../components/Footer';

export const runtime = 'edge';

async function getStats() {
  try {
    const { getStats: fetchStats } = await import('../lib/api');
    return await fetchStats();
  } catch {
    return { total: '--', photos: '--', videos: '--', apiOnline: false };
  }
}

export default async function Home() {
  const stats = await getStats();
  return (
    <main>
      <AncientLoader />
      <TreasureFX />
      <Header />
      <MapSection />

      <section className="tm-container" style={{ padding: '3rem 1rem 0' }}>
        <h2 className="tm-h2">Voyage Manifest</h2>
        <div className="tm-divider" />
        <div className="tm-grid tm-grid-4" style={{ marginTop: '2rem' }}>
          <LogCard label="Total Treasures" value={stats.total} sub="Artifacts recovered." delay={0} />
          <LogCard label="Photographs" value={stats.photos} sub="Pressed moments." delay={0.1} />
          <LogCard label="Moving Pictures" value={stats.videos} sub="Living memories." delay={0.2} />
          <LogCard label="Archive" value={stats.apiOnline ? 'Online' : 'Offline'} sub="Connection status." delay={0.3} />
        </div>
      </section>

      <JournalGrid />
      <Footer />
    </main>
  );
}
