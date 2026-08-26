import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UsedProductForm } from "@/components/admin/used-product-form";
import { getAllCategoriesFlat } from "@/lib/admin-categories";
import { getUsedProductForEdit } from "@/lib/admin-usados";
import { getBrandOptions } from "@/lib/product-query";

export const metadata: Metadata = {
  title: "Editar producto usado | SF ProPadel Admin",
};

export default async function EditarUsadoPage(
  props: PageProps<"/admin/usados/[id]/editar">,
) {
  const { id } = await props.params;

  const [product, categories, brands] = await Promise.all([
    getUsedProductForEdit(id),
    getAllCategoriesFlat(),
    getBrandOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar producto usado
      </h1>
      <UsedProductForm
        mode="edit"
        initialData={product}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
