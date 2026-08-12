import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getCategoryNav, getSiteSettings } from "@/lib/site-data";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, settings] = await Promise.all([
    getCategoryNav(),
    getSiteSettings(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader categories={categories} settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
