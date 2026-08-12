import { ProductListing } from "@/components/site/product-listing";

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
