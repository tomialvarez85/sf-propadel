import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/product-form";
import { getAllCategoriesFlat } from "@/lib/admin-categories";
import { getBrandOptions } from "@/lib/product-query";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Nuevo producto | SF ProPadel Admin",
};

export default async function NuevoProductoPage() {
  const [categories, brands, settings] = await Promise.all([
    getAllCategoriesFlat(),
    getBrandOptions(),
    getSiteSettings(),
  ]);

  const descuentosGenerales = {
    transferencia: settings?.descuentoTransferencia ?? null,
    efectivo: settings?.descuentoEfectivo ?? null,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo producto</h1>
      <ProductForm
        mode="create"
        categories={categories}
        brands={brands}
        descuentosGenerales={descuentosGenerales}
      />
    </div>
  );
}
