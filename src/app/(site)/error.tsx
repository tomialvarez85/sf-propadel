"use client";

import { ErrorState } from "@/components/error-state";

export default function SiteError({
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
      title="No pudimos cargar esta página"
      description="Ocurrió un error inesperado. Probá recargar la página en unos segundos."
    />
  );
}
