"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
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
