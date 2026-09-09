import type { Metadata } from 'next';
import './globals.css';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: "The Explorer's Journal | Ancient Treasure Map",
  description: 'An animated ancient treasure-map journal of voyages and discoveries.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=Almendra:ital,wght@0,400;0,700;1,400&family=Fondamento&family=IM+Fell+English:ital@0;1&family=MedievalSharp&family=Special+Elite&family=Cinzel:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
