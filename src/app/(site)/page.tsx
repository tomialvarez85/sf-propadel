import { CategoryTiles, type CategoryTile } from "@/components/site/category-tiles";
import { HeroBanner } from "@/components/site/hero-banner";
import { TestimonialsSection } from "@/components/site/testimonials-section";
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
  getActiveTestimonials,
  getCategoryBySlug,
  getDestacadoProducts,
  getOfertaProducts,
} from "@/lib/home-data";
import { getSiteSettings } from "@/lib/site-data";

function ProductSection({
  title,
  products,
  layout = "grid",
  cantidadCuotas,
  cuotasSinInteres,
}: {
  title: string;
  products: ProductCardData[];
  layout?: "grid" | "carousel";
  cantidadCuotas: number;
  cuotasSinInteres: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section>
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
                  <ProductCard
                    product={product}
                    cantidadCuotas={cantidadCuotas}
                    cuotasSinInteres={cuotasSinInteres}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cantidadCuotas={cantidadCuotas}
                cuotasSinInteres={cuotasSinInteres}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [accesorios, ofertas, destacados, testimonials, settings] =
    await Promise.all([
      getCategoryBySlug("accesorios"),
      getOfertaProducts(),
      getDestacadoProducts(),
      getActiveTestimonials(),
      getSiteSettings(),
    ]);

  const cantidadCuotas = settings?.cantidadCuotas ?? 12;
  const cuotasSinInteres = settings?.cuotasSinInteres ?? true;

  const categoryTiles: CategoryTile[] = [
    {
      key: "hombre",
      nombre: "Hombre",
      href: "/productos?genero=hombre",
      // Fija en /public — el dueño no puede cambiarla desde el admin, ver
      // DESIGN.md > Category Tiles.
      imagen: "/tiles/hombre.jpg",
    },
    {
      key: "mujer",
      nombre: "Mujer",
      href: "/productos?genero=mujer",
      imagen: "/tiles/mujer.jpg",
    },
    {
      key: "accesorios",
      nombre: accesorios?.nombre ?? "Accesorios",
      href: accesorios ? `/${accesorios.slug}` : "/productos?categoria=accesorios",
      // Fija en /public, igual que Hombre/Mujer — Category.imagen fue
      // eliminado del schema (ver DESIGN.md > Category Tiles).
      imagen: "/tiles/accesorios.jpg",
    },
  ];

  return (
    <>
      <HeroBanner />

      <CategoryTiles tiles={categoryTiles} />

      <ProductSection
        title="Ofertas"
        products={ofertas}
        layout="carousel"
        cantidadCuotas={cantidadCuotas}
        cuotasSinInteres={cuotasSinInteres}
      />
      <ProductSection
        title="Destacados"
        products={destacados}
        layout="carousel"
        cantidadCuotas={cantidadCuotas}
        cuotasSinInteres={cuotasSinInteres}
      />

      <TestimonialsSection testimonials={testimonials} />
    </>
  );
}
