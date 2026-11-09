import type { Metadata } from "next";

import { HomeBlockForm } from "@/components/admin/home-block-form";

export const metadata: Metadata = {
  title: "Nuevo | Inicio | SF ProPadel Admin",
};

export default async function NuevoHomeBlockPage(
  props: PageProps<"/admin/inicio/nuevo">,
) {
  const { tipo } = await props.searchParams;
  const isTile = tipo === "TILE";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isTile ? "Nueva tarjeta de categoría" : "Nuevo slide del banner"}
      </h1>
      <HomeBlockForm tipo={isTile ? "TILE" : "BANNER"} />
    </div>
  );
}
