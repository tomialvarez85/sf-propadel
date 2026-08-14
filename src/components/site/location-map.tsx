import { cn } from "@/lib/utils";

export function LocationMap({
  direccion,
  className,
}: {
  direccion: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg", className)}>
      <iframe
        title="Ubicación de SF ProPadel"
        src={`https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`}
        className="size-full min-h-40 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
