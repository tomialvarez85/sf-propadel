import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeBlockForm } from "@/components/admin/home-block-form";
import { getHomeBlockForEdit, getLinkTargets } from "@/lib/home-blocks";

export const metadata: Metadata = {
  title: "Editar | Banners | SF ProPadel Admin",
};

export default async function EditarHomeBlockPage(
  props: PageProps<"/admin/banners/[id]/editar">,
) {
  const { id } = await props.params;
  const [block, { categories, products }] = await Promise.all([
    getHomeBlockForEdit(id),
    getLinkTargets(),
  ]);

  if (!block) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {block.tipo === "TILE"
          ? "Editar tarjeta de categoría"
          : "Editar slide del banner"}
      </h1>
      <HomeBlockForm
        tipo={block.tipo}
        initialData={block}
        categories={categories}
        products={products}
      />
    </div>
  );
}
