// Canonical production domain — sf-propadel.com.ar (sin www), confirmed by
// the owner. Used as a safety-net fallback so a misconfigured/missing
// NEXT_PUBLIC_SITE_URL on Vercel can never leak "http://localhost:3000"
// into the live sitemap/robots/emails again (see: that exact incident).
const PRODUCTION_SITE_URL = "https://sf-propadel.com.ar";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : PRODUCTION_SITE_URL);
