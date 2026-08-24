import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductListing } from "@/components/site/product-listing";
import { resolveCategoryScope } from "@/lib/product-query";

export async function generateMetadata(
  props: PageProps<"/[categoria]">,
): Promise<Metadata> {
  const { categoria } = await props.params;
  const categoryScope = await resolveCategoryScope(categoria);

  if (!categoryScope) {
    return { title: "Categoría no encontrada | SF ProPadel" };
  }

  return {
    title: `${categoryScope.nombre} | SF ProPadel`,
    description: `Comprá ${categoryScope.nombre.toLowerCase()} de pádel en SF ProPadel — envíos a todo el país.`,
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
