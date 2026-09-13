import { SITE_URL } from "@/lib/site-url";

export const SITE_NAME = "SF ProPadel";

// The hero photo — already the visual "face" of the brand on the home page,
// reused as the fallback social-share image for pages that don't have a
// product/photo of their own (nosotros, contacto, usados, category listings).
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero/banner-principal.jpg`;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Google truncates meta descriptions to roughly 155-160 characters in
 * search results — trims on a word boundary so it doesn't cut mid-word.
 */
export function truncateDescription(text: string, maxLength = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Shared Open Graph + Twitter Card + canonical block for every public page —
 * centralized so link previews (WhatsApp, redes) look right everywhere
 * without repeating the same shape on each page.
 */
export function buildSocialMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  const url = absoluteUrl(path);

  return {
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image }],
      locale: "es_AR",
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [image],
    },
  };
}
