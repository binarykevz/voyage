import AncientLoader from '../components/AncientLoader';
import TreasureFX from '../components/TreasureFX';
import Header from '../components/Header';
import MapSection from '../components/MapSection';
import Manifest from '../components/Manifest';
import JournalGrid from '../components/JournalGrid';
import Footer from '../components/Footer';

export const runtime = 'edge';

export default function Home() {
  return (
    <main>
      <AncientLoader />
      <TreasureFX />
      <Header />
      <MapSection />
      <Manifest />
      <JournalGrid />
      <Footer />
    </main>
  );
}
