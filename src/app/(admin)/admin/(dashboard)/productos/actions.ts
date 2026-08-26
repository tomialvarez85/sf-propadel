"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  resolveUniqueSlug,
  validateImportRow,
  type ImportColumnKey,
} from "@/lib/product-import";
import { productSchema } from "@/lib/validations/product";

export type ActionResult =
  { success: true } | { success: false; error: string };

function revalidateProductPaths() {
  revalidatePath("/admin/productos");
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/productos/[slug]", "page");
}

function normalizeProductData(data: ReturnType<typeof productSchema.parse>) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion,
    precio: data.precio,
    precioAnterior: data.precioAnterior || null,
    stock: data.stock,
    genero: data.genero || null,
    categoryId: data.categoryId,
    brandId: data.brandId,
    destacado: data.destacado,
    enOferta: data.enOferta,
    activo: data.activo,
  };
}

export async function createProduct(input: unknown): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.product.create({
      data: {
        ...normalizeProductData(parsed.data),
        images: {
          create: parsed.data.images.map((image, index) => ({
            url: image.url,
            orden: index,
          })),
        },
        variants: {
          create: parsed.data.variants.map((variant) => ({
            tipo: variant.tipo,
            valor: variant.valor,
            stock: variant.stock,
          })),
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Ya existe un producto con ese slug." };
    }
    console.error("No se pudo crear el producto:", error);
    return { success: false, error: "No se pudo crear el producto." };
  }

  revalidateProductPaths();
  return { success: true };
}

export async function updateProduct(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...normalizeProductData(parsed.data),
        images: {
          deleteMany: {},
          create: parsed.data.images.map((image, index) => ({
            url: image.url,
            orden: index,
          })),
        },
        variants: {
          deleteMany: {},
          create: parsed.data.variants.map((variant) => ({
            tipo: variant.tipo,
            valor: variant.valor,
            stock: variant.stock,
          })),
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Ya existe un producto con ese slug." };
    }
    console.error("No se pudo actualizar el producto:", error);
    return { success: false, error: "No se pudo actualizar el producto." };
  }

  revalidateProductPaths();
  return { success: true };
}

export type ProductEditableField =
  | "nombre"
  | "categoryId"
  | "brandId"
  | "precio"
  | "stock";

export async function updateProductField(
  id: string,
  field: ProductEditableField,
  value: string | number,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  let data: Prisma.ProductUpdateInput;

  switch (field) {
    case "nombre": {
      const nombre = String(value).trim();
      if (!nombre) {
        return { success: false, error: "El nombre no puede estar vacío." };
      }
      data = { nombre };
      break;
    }
    case "categoryId": {
      const categoryId = String(value).trim();
      if (!categoryId) {
        return { success: false, error: "Elegí una categoría." };
      }
      data = { category: { connect: { id: categoryId } } };
      break;
    }
    case "brandId": {
      const brandId = String(value).trim();
      if (!brandId) {
        return { success: false, error: "Elegí una marca." };
      }
      data = { brand: { connect: { id: brandId } } };
      break;
    }
    case "precio": {
      const precio = Number(value);
      if (!Number.isFinite(precio) || precio <= 0) {
        return {
          success: false,
          error: "El precio tiene que ser un número mayor a cero.",
        };
      }
      data = { precio };
      break;
    }
    case "stock": {
      const stock = Number(value);
      if (!Number.isInteger(stock) || stock < 0) {
        return {
          success: false,
          error: "El stock tiene que ser un número entero, cero o mayor.",
        };
      }
      data = { stock };
      break;
    }
  }

  try {
    await prisma.product.update({ where: { id }, data });
  } catch (error) {
    console.error(`No se pudo actualizar "${field}" del producto:`, error);
    return { success: false, error: "No se pudo guardar el cambio." };
  }

  revalidateProductPaths();
  return { success: true };
}

/**
 * Replaces only the primary (lowest `orden`) image — the quick edit from
 * the products table/cards. Products with several images keep the rest
 * untouched; full gallery add/reorder/remove still lives in "Editar".
 */
export async function updateProductPrimaryImage(
  productId: string,
  url: string,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  if (!url.trim()) {
    return { success: false, error: "Falta la URL de la imagen." };
  }

  try {
    const primary = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { orden: "asc" },
    });

    if (primary) {
      await prisma.productImage.update({
        where: { id: primary.id },
        data: { url },
      });
    } else {
      await prisma.productImage.create({
        data: { productId, url, orden: 0 },
      });
    }
  } catch (error) {
    console.error("No se pudo actualizar la imagen del producto:", error);
    return { success: false, error: "No se pudo guardar la imagen." };
  }

  revalidateProductPaths();
  return { success: true };
}

export async function toggleProductActivo(
  id: string,
  activo: boolean,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.product.update({ where: { id }, data: { activo } });
  } catch (error) {
    console.error("No se pudo actualizar el estado del producto:", error);
    return { success: false, error: "No se pudo actualizar el estado." };
  }

  revalidateProductPaths();
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error("No se pudo eliminar el producto:", error);
    return { success: false, error: "No se pudo eliminar el producto." };
  }

  revalidateProductPaths();
  return { success: true };
}

export type ImportProductsRow = {
  rowNumber: number;
  raw: Record<ImportColumnKey, string>;
};

export type ImportProductsResult =
  | {
      success: true;
      created: number;
      errors: { rowNumber: number; reason: string }[];
    }
  | { success: false; error: string };

/**
 * Re-validates every row server-side against live categories/marcas —
 * never trusts the client's preview-time resolution (data could be stale,
 * or the request could be forged). Rows are created one at a time rather
 * than via createMany so a single bad row (e.g. a last-second unique
 * constraint hit) doesn't sink the rest of the batch — same "no todo o
 * nada" principle the preview already applies to validation.
 */
export async function importProducts(
  rows: ImportProductsRow[],
): Promise<ImportProductsResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, error: "No hay filas para importar." };
  }

  const [categories, brands, existingProducts] = await Promise.all([
    prisma.category.findMany({ select: { id: true, nombre: true } }),
    prisma.brand.findMany({ select: { id: true, nombre: true } }),
    prisma.product.findMany({ select: { slug: true } }),
  ]);

  const usedSlugs = new Set(existingProducts.map((product) => product.slug));
  const rowErrors: { rowNumber: number; reason: string }[] = [];
  let created = 0;

  for (const { rowNumber, raw } of rows) {
    const result = validateImportRow(raw, rowNumber, categories, brands);
    if (!result.data) {
      rowErrors.push({ rowNumber, reason: result.errors.join(" ") });
      continue;
    }

    const slug = resolveUniqueSlug(result.data.nombre, usedSlugs);

    try {
      await prisma.product.create({
        data: {
          nombre: result.data.nombre,
          slug,
          descripcion: result.data.descripcion,
          precio: result.data.precio,
          precioAnterior: result.data.precioAnterior,
          stock: result.data.stock,
          genero: result.data.genero,
          categoryId: result.data.categoryId,
          brandId: result.data.brandId,
          destacado: result.data.destacado,
          enOferta: result.data.enOferta,
          activo: result.data.activo,
          condicion: "NUEVO",
        },
      });
      created++;
    } catch (error) {
      console.error(`No se pudo crear el producto de la fila ${rowNumber}:`, error);
      rowErrors.push({
        rowNumber,
        reason: "No se pudo guardar en la base de datos.",
      });
    }
  }

  revalidateProductPaths();
  return { success: true, created, errors: rowErrors };
}
