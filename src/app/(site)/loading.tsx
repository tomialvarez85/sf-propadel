import { ProductGridSkeleton } from "@/components/site/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SiteLoading() {
  return (
    <div className="flex flex-col">
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <Skeleton className="aspect-[16/5] w-full rounded-xl" />
      </div>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="aspect-square rounded-xl" />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="mb-6 h-8 w-32" />
        <ProductGridSkeleton count={4} />
      </section>
    </div>
  );
}
