import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandForm } from "@/components/admin/brand-form";
import { getBrandForEdit } from "@/lib/admin-brands";

export const metadata: Metadata = {
  title: "Editar marca | SF ProPadel Admin",
};

export default async function EditarMarcaPage(
  props: PageProps<"/admin/marcas/[id]/editar">,
) {
  const { id } = await props.params;
  const brand = await getBrandForEdit(id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Editar marca</h1>
      <BrandForm mode="edit" initialData={brand} />
    </div>
  );
}
