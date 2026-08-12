import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder images used by prisma/seed.ts until real product/banner assets exist.
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage public URLs (product/category images uploaded from the admin).
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
