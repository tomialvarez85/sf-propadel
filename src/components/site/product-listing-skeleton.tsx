import { ProductGridSkeleton } from "@/components/site/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductListingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Skeleton className="h-8 w-48" />

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <aside className="hidden w-56 shrink-0 flex-col gap-4 md:flex">
          {Array.from({ length: 4 }, (_, group) => (
            <div key={group} className="border-border flex flex-col gap-3 border-b pb-4 last:border-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-border mb-6 flex items-center justify-between gap-4 border-b pb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
