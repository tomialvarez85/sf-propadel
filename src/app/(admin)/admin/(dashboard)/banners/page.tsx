import type { Metadata } from "next";

import { HeroBannerForm } from "@/components/admin/hero-banner-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = { title: "Banner del home | SF ProPadel Admin" };

export default async function AdminBannersPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Banner del home</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          El home muestra una sola imagen fija, no un carrusel — no hace falta
          cargar varias ni definir un orden.
        </p>
      </div>
      <Card>
        <CardContent>
          <HeroBannerForm
            initialData={{
              imagen: settings?.heroImagen ?? "",
              titulo: settings?.heroTitulo ?? "",
              link: settings?.heroLink ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
