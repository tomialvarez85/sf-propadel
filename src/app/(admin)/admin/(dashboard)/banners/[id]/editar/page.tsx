import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BannerForm } from "@/components/admin/banner-form";
import { getBannerForEdit } from "@/lib/admin-banners";

export const metadata: Metadata = {
  title: "Editar banner | SF ProPadel Admin",
};

export default async function EditarBannerPage(
  props: PageProps<"/admin/banners/[id]/editar">,
) {
  const { id } = await props.params;
  const banner = await getBannerForEdit(id);

  if (!banner) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Editar banner</h1>
      <BannerForm mode="edit" initialData={banner} />
    </div>
  );
}
