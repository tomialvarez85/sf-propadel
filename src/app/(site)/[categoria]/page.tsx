import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductListing } from "@/components/site/product-listing";
import { resolveCategoryScope } from "@/lib/product-query";
import { buildSocialMetadata } from "@/lib/seo";

export async function generateMetadata(
  props: PageProps<"/[categoria]">,
): Promise<Metadata> {
  const { categoria } = await props.params;
  const categoryScope = await resolveCategoryScope(categoria);

  if (!categoryScope) {
    return { title: "Categoría no encontrada | SF ProPadel" };
  }

  const title = `${categoryScope.nombre} | SF ProPadel`;
  const description = `Comprá ${categoryScope.nombre.toLowerCase()} de pádel en SF ProPadel — envíos a todo el país.`;

  // Same reasoning as /productos: canonical is the bare category path, so
  // ?marca=/precioMin=/etc. combinations don't get indexed as separate pages.
  return {
    title,
    description,
    ...buildSocialMetadata({ title, description, path: `/${categoryScope.slug}` }),
  };
}

export default async function CategoriaPage(props: PageProps<"/[categoria]">) {
  const [{ categoria }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const categoryScope = await resolveCategoryScope(categoria);

  if (!categoryScope) {
    notFound();
  }

  return (
    <ProductListing
      searchParams={searchParams}
      categoryScope={categoryScope}
      basePath={`/${categoryScope.slug}`}
    />
  );
}
