// Independent from product-listing.tsx on purpose (see used-product-query.ts
// for the same reasoning) — /usados has its own orchestrator so a change
// made for /productos can never silently break it, and vice versa. No
// filters, sort, or pagination at all, by explicit user request: every used
// product sits in a single row, side by side, scrollable horizontally if it
// doesn't fit — no wrap, no pages.
import { UsedProductCard } from "@/components/site/used-product-card";
import { getUsedProducts } from "@/lib/used-product-query";

export async function UsedListing() {
  const products = await getUsedProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.015em]">
        Productos Usados
      </h1>

      <p className="text-muted-foreground mt-2 mb-8 text-sm">
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </p>

      {products.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center text-sm">
          Todavía no hay productos usados cargados.
        </p>
      ) : (
        <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2">
          {products.map((product) => (
            <div key={product.id} className="w-48 shrink-0 sm:w-56">
              <UsedProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
