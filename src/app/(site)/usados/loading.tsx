import { Skeleton } from "@/components/ui/skeleton";

export default function UsadosLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 mb-8 h-4 w-24" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex w-48 shrink-0 flex-col gap-3 sm:w-56">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex flex-col gap-2 px-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
