import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeBlockForm } from "@/components/admin/home-block-form";
import { getHomeBlockForEdit } from "@/lib/home-blocks";

export const metadata: Metadata = {
  title: "Editar | Inicio | SF ProPadel Admin",
};

export default async function EditarHomeBlockPage(
  props: PageProps<"/admin/inicio/[id]/editar">,
) {
  const { id } = await props.params;
  const block = await getHomeBlockForEdit(id);

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
      <HomeBlockForm tipo={block.tipo} initialData={block} />
    </div>
  );
}
