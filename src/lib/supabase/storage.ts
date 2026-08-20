import { createClient } from "@/lib/supabase/client";
import {
  COMPROBANTES_BUCKET,
  COMPROBANTE_ALLOWED_TYPES,
  COMPROBANTE_MAX_SIZE_BYTES,
} from "@/lib/storage-constants";

export const UPLOADS_BUCKET = "product-images";

/**
 * Uploads a file to the shared uploads bucket (client-side, using the
 * logged-in admin's session — Storage RLS restricts writes to authenticated
 * users) and returns its public URL.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .upload(path, file);

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(path);

  return publicUrl;
}

/**
 * Uploads a payment receipt for an order (client-side, no auth required —
 * the bucket's INSERT policy is public on purpose, since the customer
 * checkout flow has no Supabase session). Bucket is private for reads
 * (SELECT restricted to `authenticated`), so this returns the storage PATH,
 * not a public URL — use getComprobanteSignedUrl to view it later.
 */
export async function uploadComprobante(
  file: File,
  orderId: string,
): Promise<string> {
  if (!COMPROBANTE_ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Solo se aceptan imágenes (JPG, PNG, WEBP, GIF) o PDF.");
  }
  if (file.size > COMPROBANTE_MAX_SIZE_BYTES) {
    throw new Error("El archivo no puede superar los 5MB.");
  }

  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "bin";
  const path = `${orderId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(COMPROBANTES_BUCKET)
    .upload(path, file);

  if (error) {
    throw new Error(`No se pudo subir el comprobante: ${error.message}`);
  }

  return path;
}

/**
 * Generates a short-lived signed URL to view a comprobante. Only works
 * under an authenticated (admin) session — the bucket's SELECT policy is
 * restricted to `authenticated`, matching "solo el dueño/admin puede ver
 * los comprobantes, no es público".
 */
export async function getComprobanteSignedUrl(path: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(COMPROBANTES_BUCKET)
    .createSignedUrl(path, 300);

  if (error || !data) {
    throw new Error("No se pudo generar el link del comprobante.");
  }

  return data.signedUrl;
}
