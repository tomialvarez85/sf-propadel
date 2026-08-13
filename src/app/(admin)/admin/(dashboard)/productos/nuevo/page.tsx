import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesFlat } from "@/lib/admin-categories";
import { getBrandOptions } from "@/lib/product-query";

export const metadata: Metadata = {
  title: "Nuevo producto | SF ProPadel Admin",
};

export default async function NuevoProductoPage() {
  const [categories, brands] = await Promise.all([
    getAllCategoriesFlat(),
    getBrandOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}
