/**
 * ============================================================================
 *  ⚠️  IMÁGENES PLACEHOLDER TEMPORALES PARA DEMO — NO USAR EN PRODUCCIÓN ⚠️
 * ============================================================================
 * Este script pobla los 12 productos de `prisma/seed.ts` con fotos de stock
 * GENÉRICAS (sin marca), traídas de la API de Pexels, para poder mostrarle
 * el sistema a un cliente con el catálogo visualmente completo mientras se
 * consiguen las fotos reales de sus productos.
 *
 * Estas fotos NO son los productos reales del negocio. Hay que reemplazar
 * cada una por fotografía real del catálogo antes de cualquier lanzamiento
 * público — ver la guía de fotos en el uploader de /admin/productos.
 *
 * Licencia: fotos de Pexels (https://www.pexels.com/license/) — uso
 * comercial libre, sin costo, atribución no obligatoria pero valorada. Este
 * script imprime el nombre del fotógrafo y el link a cada foto en la
 * consola para poder acreditar si se quiere.
 *
 * Uso:
 *   npx tsx scripts/seed-placeholder-images.ts
 *
 * Requiere PEXELS_API_KEY en .env (ver README.md, sección "Imágenes
 * placeholder de demo", para conseguir una gratis).
 * ============================================================================
 */

import { createClient } from "@supabase/supabase-js";

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const UPLOADS_BUCKET = "product-images";

if (!PEXELS_API_KEY) {
  console.error(
    "Falta PEXELS_API_KEY en .env. Ver README.md ('Imágenes placeholder de demo') para conseguir una gratis.",
  );
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.",
  );
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Una foto específica por categoría, no "la primera que devuelva una
// búsqueda" — una ronda inicial con queries genéricas ("padel racket",
// "tennis apparel", etc.) devolvió resultados con marcas reales visibles
// (Wilson, Head — Head además es una marca real que ya vende esta tienda,
// así que mostrarla como "genérica" sería directamente engañoso) o fuera
// de tema (hockey, golf, básquet). Estas 5 fueron revisadas a mano — sin
// logos de marca, sin caras en primer plano, temáticamente razonables.
const CATEGORY_PHOTO_IDS: Record<string, number> = {
  paletas: 34116480, // cancha de pádel/tenis aérea, sin marca ni gente en primer plano
  indumentaria: 8743972, // percha de ropa deportiva, fondo desenfocado
  calzado: 1461048, // zapatillas blancas, estudio, sin logo legible
  accesorios: 6878018, // volante de bádminton, primer plano, sin marca
  bolsos: 1214212, // bolso negro colgado, fondo neutro, sin marca ni gente
};

type PexelsPhoto = {
  id: number;
  photographer: string;
  url: string;
  src: { large: string };
};

async function fetchPexelsPhoto(id: number): Promise<PexelsPhoto | null> {
  const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
    headers: { Authorization: PEXELS_API_KEY! },
  });
  if (!res.ok) {
    console.error(`Pexels devolvió ${res.status} ${res.statusText} para la foto ${id}.`);
    return null;
  }
  return (await res.json()) as PexelsPhoto;
}

async function downloadAndUpload(
  photo: PexelsPhoto,
  categorySlug: string,
): Promise<string> {
  const imageRes = await fetch(photo.src.large);
  if (!imageRes.ok) {
    throw new Error(`No se pudo descargar la foto de Pexels (${imageRes.status}).`);
  }
  const buffer = Buffer.from(await imageRes.arrayBuffer());
  const path = `seed-placeholders/${categorySlug}-${photo.id}.jpg`;

  const { error } = await admin.storage
    .from(UPLOADS_BUCKET)
    .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Falló la subida a Storage: ${error.message}`);

  const {
    data: { publicUrl },
  } = admin.storage.from(UPLOADS_BUCKET).getPublicUrl(path);
  return publicUrl;
}

/** Un producto "ya tiene foto real" si alguna de sus imágenes no es ni el
 * placeholder gris de placehold.co que carga prisma/seed.ts NI una foto
 * subida por una corrida anterior de este mismo script (carpeta
 * seed-placeholders/ en Storage) — así una corrida posterior puede
 * actualizar/corregir sus propios placeholders sin pisar una foto real
 * que el dueño haya subido a mano. */
function hasRealPhoto(images: { url: string }[]): boolean {
  return images.some(
    (img) =>
      !img.url.startsWith("https://placehold.co") &&
      !img.url.includes("/seed-placeholders/"),
  );
}

async function main() {
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, nombre: true },
  });

  const categoryImageUrl = new Map<string, string>();

  for (const category of categories) {
    const photoId = CATEGORY_PHOTO_IDS[category.slug];
    if (!photoId) {
      console.warn(`Sin foto asignada para categoría "${category.slug}" — se saltea.`);
      continue;
    }

    const photo = await fetchPexelsPhoto(photoId);
    if (!photo) {
      console.warn(`No se pudo obtener la foto ${photoId} de Pexels (${category.nombre}).`);
      continue;
    }

    const url = await downloadAndUpload(photo, category.slug);
    categoryImageUrl.set(category.id, url);
    console.log(
      `[${category.nombre}] foto de ${photo.photographer} (${photo.url}) subida como ${url}`,
    );
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      nombre: true,
      categoryId: true,
      images: { select: { url: true } },
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (hasRealPhoto(product.images)) {
      console.log(`Saltea "${product.nombre}" — ya tiene una foto real cargada.`);
      skipped++;
      continue;
    }

    const imageUrl = categoryImageUrl.get(product.categoryId);
    if (!imageUrl) {
      console.warn(`Sin imagen de categoría disponible para "${product.nombre}" — se saltea.`);
      continue;
    }

    await prisma.productImage.upsert({
      where: { id: `${product.id}-seed-image` },
      update: { url: imageUrl },
      create: {
        id: `${product.id}-seed-image`,
        productId: product.id,
        url: imageUrl,
        orden: 1,
      },
    });
    updated++;
  }

  console.log(
    `\nListo: ${updated} productos actualizados con foto placeholder, ${skipped} salteados (ya tenían foto real).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
