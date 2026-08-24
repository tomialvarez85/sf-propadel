import type { Metadata } from "next";

import { ProductListing } from "@/components/site/product-listing";

export const metadata: Metadata = {
  title: "Productos | SF ProPadel",
  description:
    "Explorá el catálogo completo de SF ProPadel: paletas, indumentaria, calzado, accesorios y bolsos de pádel.",
};

export default async function ProductosPage(props: PageProps<"/productos">) {
  const searchParams = await props.searchParams;

  return (
    <ProductListing
      searchParams={searchParams}
      categoryScope={null}
      basePath="/productos"
    />
  );
}
