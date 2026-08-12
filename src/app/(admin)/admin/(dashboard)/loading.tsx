import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="border-border rounded-xl border p-4">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="size-10 shrink-0 rounded-md" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
