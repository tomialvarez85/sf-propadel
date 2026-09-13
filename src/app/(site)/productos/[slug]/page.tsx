import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/site/json-ld";
import { ProductCard } from "@/components/site/product-card";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductPurchasePanel } from "@/components/site/product-purchase-panel";
import { getProductBySlug, getRelatedProducts } from "@/lib/product-detail";
import { absoluteUrl, buildSocialMetadata, truncateDescription } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-data";

export async function generateMetadata(
  props: PageProps<"/productos/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado | SF ProPadel" };
  }

  const title = `${product.nombre} | ${product.brand.nombre} | SF ProPadel`;
  const description = truncateDescription(product.descripcion);
  const image = product.images[0]?.url;

  return {
    title,
    description,
    ...buildSocialMetadata({
      title: product.nombre,
      description,
      path: `/productos/${slug}`,
      image,
    }),
  };
}

export default async function ProductoPage(
  props: PageProps<"/productos/[slug]">,
) {
  const { slug } = await props.params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.categoryId,
    product.id,
    product.condicion,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.nombre,
          description: product.descripcion,
          image: product.images.map((image) => image.url),
          brand: { "@type": "Brand", name: product.brand.nombre },
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/productos/${slug}`),
            priceCurrency: "ARS",
            price: product.precio,
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }}
      />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
        <ProductGallery images={product.images} productName={product.nombre} />
        <ProductPurchasePanel
          id={product.id}
          slug={slug}
          nombre={product.nombre}
          imagen={product.images[0]?.url ?? null}
          brand={product.brand}
          precio={product.precio}
          precioAnterior={product.precioAnterior}
          stock={product.stock}
          condicion={product.condicion}
          permiteCuotas={product.permiteCuotas}
          estadoConservacion={product.estadoConservacion}
          variants={product.variants}
          whatsapp={settings?.whatsapp ?? null}
          cantidadCuotas={settings?.cantidadCuotas ?? 12}
          cuotasSinInteres={settings?.cuotasSinInteres ?? true}
          descuentoTransferencia={settings?.descuentoTransferencia ?? null}
          mostrarPrecioSinImpuestos={settings?.mostrarPrecioSinImpuestos ?? false}
        />
      </div>

      {product.descripcion && (
        <section className="mt-12 max-w-3xl">
          <h2 className="font-heading mb-6 text-2xl font-bold tracking-[-0.015em]">
            Descripción
          </h2>
          <p className="text-muted-foreground text-sm whitespace-pre-line">
            {product.descripcion}
          </p>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading mb-6 text-2xl font-bold tracking-[-0.015em]">
            También te puede interesar
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                product={related}
                cantidadCuotas={settings?.cantidadCuotas ?? 12}
                cuotasSinInteres={settings?.cuotasSinInteres ?? true}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
