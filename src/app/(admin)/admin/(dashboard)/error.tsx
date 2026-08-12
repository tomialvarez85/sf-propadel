"use client";

import { ErrorState } from "@/components/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="No pudimos cargar esta sección"
      description="Ocurrió un error inesperado en el panel. Probá de nuevo."
    />
  );
}
