import type { Metadata } from "next";

import { HomeBlockForm } from "@/components/admin/home-block-form";
import { getLinkTargets } from "@/lib/home-blocks";

export const metadata: Metadata = {
  title: "Nuevo | Banners | SF ProPadel Admin",
};

export default async function NuevoHomeBlockPage(
  props: PageProps<"/admin/banners/nuevo">,
) {
  const { tipo } = await props.searchParams;
  const isTile = tipo === "TILE";
  const { categories, products } = await getLinkTargets();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isTile ? "Nueva tarjeta de categoría" : "Nuevo slide del banner"}
      </h1>
      <HomeBlockForm
        tipo={isTile ? "TILE" : "BANNER"}
        categories={categories}
        products={products}
      />
    </div>
  );
}
