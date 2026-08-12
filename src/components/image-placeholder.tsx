import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ImagePlaceholder({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground/40 absolute inset-0 flex items-center justify-center",
        className,
      )}
    >
      <ImageIcon className={cn("size-8", iconClassName)} />
    </div>
  );
}
