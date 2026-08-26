"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { usedProductSchema } from "@/lib/validations/used-product";

export type ActionResult =
  { success: true } | { success: false; error: string };

function revalidateUsedProductPaths() {
  revalidatePath("/admin/usados");
  revalidatePath("/");
  revalidatePath("/usados");
  revalidatePath("/productos/[slug]", "page");
}

function normalizeUsedProductData(
  data: ReturnType<typeof usedProductSchema.parse>,
) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion,
    estadoConservacion: data.estadoConservacion || null,
    precio: data.precio,
    precioAnterior: data.precioAnterior || null,
    stock: data.stock,
    genero: data.genero || null,
    // Never taken from client input — this section only ever creates/edits
    // used products, so it's implicit rather than a form field.
    condicion: "USADO" as const,
    categoryId: data.categoryId,
    brandId: data.brandId,
    destacado: data.destacado,
    enOferta: data.enOferta,
    activo: data.activo,
  };
}

export async function createUsedProduct(input: unknown): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = usedProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.product.create({
      data: {
        ...normalizeUsedProductData(parsed.data),
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
    console.error("No se pudo crear el producto usado:", error);
    return { success: false, error: "No se pudo crear el producto." };
  }

  revalidateUsedProductPaths();
  return { success: true };
}

export async function updateUsedProduct(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = usedProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    await prisma.product.update({
      where: { id, condicion: "USADO" },
      data: {
        ...normalizeUsedProductData(parsed.data),
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
    console.error("No se pudo actualizar el producto usado:", error);
    return { success: false, error: "No se pudo actualizar el producto." };
  }

  revalidateUsedProductPaths();
  return { success: true };
}

export type UsedProductEditableField =
  | "nombre"
  | "categoryId"
  | "brandId"
  | "precio"
  | "stock";

export async function updateUsedProductField(
  id: string,
  field: UsedProductEditableField,
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
    await prisma.product.update({ where: { id, condicion: "USADO" }, data });
  } catch (error) {
    console.error(`No se pudo actualizar "${field}" del producto usado:`, error);
    return { success: false, error: "No se pudo guardar el cambio." };
  }

  revalidateUsedProductPaths();
  return { success: true };
}

/**
 * Replaces only the primary (lowest `orden`) image — same quick-edit
 * pattern as admin/productos/actions.ts's updateProductPrimaryImage.
 */
export async function updateUsedProductPrimaryImage(
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
    console.error("No se pudo actualizar la imagen del producto usado:", error);
    return { success: false, error: "No se pudo guardar la imagen." };
  }

  revalidateUsedProductPaths();
  return { success: true };
}

export async function toggleUsedProductActivo(
  id: string,
  activo: boolean,
): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.product.update({
      where: { id, condicion: "USADO" },
      data: { activo },
    });
  } catch (error) {
    console.error("No se pudo actualizar el estado del producto usado:", error);
    return { success: false, error: "No se pudo actualizar el estado." };
  }

  revalidateUsedProductPaths();
  return { success: true };
}

export async function deleteUsedProduct(id: string): Promise<ActionResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) return { success: false, error: "No autorizado." };

  try {
    await prisma.product.delete({ where: { id, condicion: "USADO" } });
  } catch (error) {
    console.error("No se pudo eliminar el producto usado:", error);
    return { success: false, error: "No se pudo eliminar el producto." };
  }

  revalidateUsedProductPaths();
  return { success: true };
}
