import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fallback for any route that doesn't set its own metadata (loading/error
// states, etc). Every real page under (site) overrides this with its own
// title/description/openGraph — see src/lib/seo.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SF ProPadel | Tienda de pádel online",
  description:
    "Tienda de artículos de pádel: paletas, indumentaria, calzado, accesorios y bolsos, con envíos a todo el país.",
};

// viewportFit "cover" is what makes env(safe-area-inset-*) resolve to real
// values instead of always 0 — see the WhatsApp float button's bottom-safe-float
// utility in globals.css, which needs this to actually clear the home-indicator
// gesture bar on notched iPhones rather than being a no-op.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
