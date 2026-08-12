import { notFound } from "next/navigation";

import { ProductListing } from "@/components/site/product-listing";
import { resolveCategoryScope } from "@/lib/product-query";

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
