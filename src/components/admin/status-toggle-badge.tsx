"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Click-to-toggle Activo/Inactivo badge. Entity-agnostic — backs Estado on
 * products and testimonials via a caller-supplied `onToggle`. */
export function StatusToggleBadge({
  label,
  initialActive,
  onToggle,
  activeMessage,
  inactiveMessage,
}: {
  /** Used only in the aria-label and toast description (e.g. product/testimonial name). */
  label: string;
  initialActive: boolean;
  onToggle: (next: boolean) => Promise<{ success: boolean; error?: string }>;
  activeMessage?: string;
  inactiveMessage?: string;
}) {
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !active;
    setActive(next); // optimistic — reverted below if the action fails
    startTransition(async () => {
      const result = await onToggle(next);
      if (!result.success) {
        setActive(!next);
        toast.error(result.error ?? "No se pudo guardar el cambio.");
        return;
      }
      toast.success(next ? (activeMessage ?? "Activado") : (inactiveMessage ?? "Desactivado"), {
        description: label,
      });
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={`Marcar ${label} como ${active ? "inactivo" : "activo"}`}
      className="cursor-pointer rounded-4xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait"
    >
      <Badge
        variant={active ? "default" : "secondary"}
        className={cn(
          "transition-opacity hover:opacity-80",
          isPending && "opacity-50",
        )}
      >
        {active ? "Activo" : "Inactivo"}
      </Badge>
    </button>
  );
}
