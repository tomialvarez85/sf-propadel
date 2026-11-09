"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * WORKAROUND TEMPORAL — límite de transformaciones de imagen de Vercel.
 *
 * Wrapper de `next/image` que, si la versión optimizada (/_next/image) falla
 * al cargar — p. ej. porque se agotó el cupo mensual de transformaciones del
 * plan Hobby de Vercel y las imágenes no cacheadas devuelven error —, vuelve a
 * renderizar la misma imagen con `unoptimized`, es decir, directo desde su URL
 * original (Supabase Storage o /public) sin pasar por la optimización.
 *
 * Se puede evaluar sacarlo (volviendo a `next/image` directo) una vez que el
 * cupo se resetee y el consumo quede bajo control, o si pasamos a un plan pago
 * sin ese límite. Mientras tanto no tiene costo: si la versión optimizada carga
 * bien, el fallback nunca se activa.
 *
 * Nota: errores ocurridos antes de la hidratación también llegan a `onError`,
 * porque next/image re-dispara la carga al montar para no perderlos.
 */
export function SafeImage({
  src,
  alt,
  onError,
  unoptimized,
  ...props
}: ImageProps) {
  // Guardamos el src que falló (no un booleano) para que, si el mismo
  // componente pasa a mostrar otra imagen, ésta vuelva a intentar la versión
  // optimizada en lugar de heredar el fallback.
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const useOriginal = unoptimized || failedSrc === src;

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={useOriginal}
      onError={(event) => {
        if (!useOriginal) setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}
