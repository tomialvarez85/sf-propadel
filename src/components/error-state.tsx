"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export function ErrorState({
  error,
  reset,
  title = "Algo salió mal",
  description = "Ocurrió un error inesperado. Probá de nuevo en unos segundos.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="text-destructive text-sm font-semibold">Error</span>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground max-w-md">{description}</p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
