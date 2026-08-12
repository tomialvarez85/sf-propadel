import type { Metadata } from "next";

import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettingsForEdit } from "@/lib/admin-settings";

export const metadata: Metadata = {
  title: "Configuración del sitio | SF ProPadel Admin",
};

export default async function AdminConfiguracionPage() {
  const settings = await getSiteSettingsForEdit();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Configuración del sitio
      </h1>
      <SiteSettingsForm initialData={settings} />
    </div>
  );
}
