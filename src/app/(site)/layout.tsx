import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { WhatsappFloatButton } from "@/components/site/whatsapp-float-button";
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
    <div className="bg-white flex min-h-screen flex-col">
      <SiteHeader categories={categories} settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsappFloatButton whatsapp={settings?.whatsapp} />
    </div>
  );
}
