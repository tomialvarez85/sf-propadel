"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleProductActivo } from "@/app/(admin)/admin/(dashboard)/productos/actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProductStatusBadge({
  id,
  nombre,
  initialActivo,
}: {
  id: string;
  nombre: string;
  initialActivo: boolean;
}) {
  const [activo, setActivo] = useState(initialActivo);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !activo;
    setActivo(next); // optimistic — reverted below if the action fails
    startTransition(async () => {
      const result = await toggleProductActivo(id, next);
      if (!result.success) {
        setActivo(!next);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "Producto activado" : "Producto desactivado", {
        description: nombre,
      });
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={`Marcar ${nombre} como ${activo ? "inactivo" : "activo"}`}
      className="cursor-pointer rounded-4xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait"
    >
      <Badge
        variant={activo ? "default" : "secondary"}
        className={cn(
          "transition-opacity hover:opacity-80",
          isPending && "opacity-50",
        )}
      >
        {activo ? "Activo" : "Inactivo"}
      </Badge>
    </button>
  );
}
