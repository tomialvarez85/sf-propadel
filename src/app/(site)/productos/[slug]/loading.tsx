import { Skeleton } from "@/components/ui/skeleton";

export default function ProductoLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="size-16 shrink-0 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-8 w-3/4" />
          </div>
          <Skeleton className="h-9 w-40" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-48" />
        </div>
      </div>
    </div>
  );
}
