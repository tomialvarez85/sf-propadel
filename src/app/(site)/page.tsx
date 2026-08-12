import { CategoryGrid } from "@/components/site/category-grid";
import { HeroCarousel } from "@/components/site/hero-carousel";
import {
  ProductCard,
  type ProductCardData,
} from "@/components/site/product-card";
import {
  getActiveBanners,
  getDestacadoProducts,
  getMainCategories,
  getOfertaProducts,
} from "@/lib/home-data";

function ProductSection({
  title,
  products,
}: {
  title: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [banners, categories, ofertas, destacados] = await Promise.all([
    getActiveBanners(),
    getMainCategories(),
    getOfertaProducts(),
    getDestacadoProducts(),
  ]);

  return (
    <>
      {banners.length > 0 && <HeroCarousel banners={banners} />}

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Categorías
          </h2>
          <CategoryGrid categories={categories} />
        </section>
      )}

      <ProductSection title="Ofertas" products={ofertas} />
      <ProductSection title="Destacados" products={destacados} />
    </>
  );
}
