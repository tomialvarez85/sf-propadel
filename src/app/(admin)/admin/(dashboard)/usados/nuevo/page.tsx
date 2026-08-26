import type { Metadata } from "next";

import { UsedProductForm } from "@/components/admin/used-product-form";
import { getAllCategoriesFlat } from "@/lib/admin-categories";
import { getBrandOptions } from "@/lib/product-query";

export const metadata: Metadata = {
  title: "Nuevo producto usado | SF ProPadel Admin",
};

export default async function NuevoUsadoPage() {
  const [categories, brands] = await Promise.all([
    getAllCategoriesFlat(),
    getBrandOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Nuevo producto usado
      </h1>
      <UsedProductForm mode="create" categories={categories} brands={brands} />
    </div>
  );
}
