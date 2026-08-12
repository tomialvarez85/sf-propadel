import { createClient } from "@/lib/supabase/client";

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
