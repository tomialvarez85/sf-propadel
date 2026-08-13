import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesFlat } from "@/lib/admin-categories";
import { getProductForEdit } from "@/lib/admin-products";
import { getBrandOptions } from "@/lib/product-query";

export const metadata: Metadata = {
  title: "Editar producto | SF ProPadel Admin",
};

export default async function EditarProductoPage(
  props: PageProps<"/admin/productos/[id]/editar">,
) {
  const { id } = await props.params;

  const [product, categories, brands] = await Promise.all([
    getProductForEdit(id),
    getAllCategoriesFlat(),
    getBrandOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Editar producto
      </h1>
      <ProductForm
        mode="edit"
        initialData={product}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
