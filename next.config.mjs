import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudflare Pages: disable Next's default image optimization
    // (or use Cloudflare Image Resizing via a loader)
    unoptimized: true,
  },
  trailingSlash: true,
};

// Automatically set up the Cloudflare dev platform during `next dev`
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;
