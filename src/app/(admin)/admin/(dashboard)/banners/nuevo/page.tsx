import type { Metadata } from "next";

import { BannerForm } from "@/components/admin/banner-form";

export const metadata: Metadata = {
  title: "Nuevo banner | SF ProPadel Admin",
};

export default function NuevoBannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo banner</h1>
      <BannerForm mode="create" />
    </div>
  );
}
