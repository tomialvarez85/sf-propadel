import { CategoryTiles, type CategoryTile } from "@/components/site/category-tiles";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { VisitUs } from "@/components/site/visit-us";
import {
  ProductCard,
  type ProductCardData,
} from "@/components/site/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  getActiveBanners,
  getCategoryBySlug,
  getDestacadoProducts,
  getOfertaProducts,
} from "@/lib/home-data";
import { getSiteSettings } from "@/lib/site-data";

function ProductSection({
  title,
  products,
  tone = "plain",
  layout = "grid",
}: {
  title: string;
  products: ProductCardData[];
  tone?: "plain" | "wash";
  layout?: "grid" | "carousel";
}) {
  if (products.length === 0) return null;

  return (
    <section className={tone === "wash" ? "bg-lime" : undefined}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-heading mb-6 text-2xl font-bold tracking-[-0.015em]">
          {title}
        </h2>
        {layout === "carousel" ? (
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-1/2 sm:basis-1/3 lg:basis-1/4"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [banners, settings, accesorios, ofertas, destacados] =
    await Promise.all([
      getActiveBanners(),
      getSiteSettings(),
      getCategoryBySlug("accesorios"),
      getOfertaProducts(),
      getDestacadoProducts(),
    ]);

  const categoryTiles: CategoryTile[] = [
    {
      key: "hombre",
      nombre: "Hombre",
      href: "/productos?genero=hombre",
      imagen: settings?.imagenGeneroHombre ?? null,
    },
    {
      key: "mujer",
      nombre: "Mujer",
      href: "/productos?genero=mujer",
      imagen: settings?.imagenGeneroMujer ?? null,
    },
    {
      key: "accesorios",
      nombre: accesorios?.nombre ?? "Accesorios",
      href: accesorios ? `/${accesorios.slug}` : "/productos?categoria=accesorios",
      imagen: accesorios?.imagen ?? null,
    },
  ];

  return (
    <>
      {banners.length > 0 && <HeroCarousel banners={banners} />}

      <CategoryTiles tiles={categoryTiles} />

      <ProductSection
        title="Ofertas"
        products={ofertas}
        tone="wash"
        layout="carousel"
      />
      <ProductSection
        title="Destacados"
        products={destacados}
        tone="wash"
        layout="carousel"
      />

      <VisitUs settings={settings} />
    </>
  );
}
