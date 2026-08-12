import { ProductGridSkeleton } from "@/components/site/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductListingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Skeleton className="h-8 w-48" />

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <aside className="hidden w-56 shrink-0 flex-col gap-6 md:flex">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-40" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
