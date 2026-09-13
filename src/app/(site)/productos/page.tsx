import type { Metadata } from "next";

import { ProductListing } from "@/components/site/product-listing";
import { buildSocialMetadata } from "@/lib/seo";

const TITLE = "Productos | SF ProPadel";
const DESCRIPTION =
  "Explorá el catálogo completo de SF ProPadel: paletas, indumentaria, calzado, accesorios y bolsos de pádel.";

// Canonical always points at the plain, unfiltered listing — /productos with
// ?marca=/precioMin=/orden=/etc. attached is the same page from Google's
// point of view, not a distinct one worth indexing on its own.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...buildSocialMetadata({ title: TITLE, description: DESCRIPTION, path: "/productos" }),
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
