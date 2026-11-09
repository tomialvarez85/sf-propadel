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
    // Cada combinación (imagen × ancho × calidad × formato) cuenta como una
    // transformación distinta en Vercel, así que limitamos los anchos posibles
    // a los que el sitio realmente usa, en vez de los 16 por defecto de Next
    // (8 deviceSizes + 8 imageSizes, hasta 3840px).
    // - deviceSizes: imágenes que ocupan un % del viewport (hero, cards,
    //   galería, categorías). 1920 alcanza para el hero (max 1152px CSS) en
    //   pantallas retina sin pedir 2048/3840.
    deviceSizes: [375, 640, 768, 1024, 1280, 1920],
    // - imageSizes: miniaturas de tamaño fijo — avatares 40px, thumbs de
    //   carrito/galería 64px, preview del admin 96px, cards de usados
    //   192–224px — en 1x y 2x (retina).
    imageSizes: [64, 128, 256],
    // Las imágenes de Supabase se suben con nombre UUID (nunca se pisan), pero
    // Storage responde con max-age=3600, así que sin esto Vercel re-optimiza
    // (= nueva transformación) cada imagen al vencer la hora. 31 días.
    // Ojo: si se reemplaza /public/hero/banner-principal.jpg por otra imagen
    // con el MISMO nombre, conviene renombrar el archivo para no servir la
    // versión cacheada vieja.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
