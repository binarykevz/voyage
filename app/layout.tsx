import type { Metadata } from 'next';
import './globals.css';

export const runtime = 'edge'; // ← Cloudflare Workers compatible

export const metadata: Metadata = {
  title: "The Explorer's Journal | A Vintage Voyage",
  description: "A vintage explorer's journal with an interactive antique world map.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧭</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Marck+Script&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
