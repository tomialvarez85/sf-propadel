import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder images used by prisma/seed.ts until real product/banner assets exist.
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage public URLs (product/category images uploaded from the admin).
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    // AVIF first (best compression), WebP fallback. Default is webp-only if unset.
    formats: ["image/avif", "image/webp"],
    // 75 (next/image's implicit default) stays for thumbnails; 85 is used on
    // product/banner/category photography (see next/image `quality` usage across
    // src/components/site/). Both must be explicitly allow-listed here starting
    // in Next.js 16 — see https://nextjs.org/docs/messages/next-image-unconfigured-qualities
    qualities: [75, 85],
  },
};

export default nextConfig;
