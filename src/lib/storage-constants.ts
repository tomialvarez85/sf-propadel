// Shared between the client-side uploader (src/lib/supabase/storage.ts) and
// server-side code that reads the same bucket (src/lib/email.ts, via
// src/lib/supabase/admin.ts) — kept import-neutral (no browser or
// service-role client code) so either side can pull it in safely.
export const COMPROBANTES_BUCKET = "comprobantes-pago";
export const COMPROBANTE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const COMPROBANTE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];
