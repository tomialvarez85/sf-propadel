// Independent from validations/product.ts on purpose (see used-product-query.ts
// for the same reasoning) — this form never sends `condicion` at all, since
// every product created/edited here is USADO by construction; the action
// (usados/actions.ts) sets it server-side, not from user input.
import { z } from "zod";

const usedProductImageSchema = z.object({
  url: z.string().url("La imagen no es válida"),
});

const usedProductVariantSchema = z.object({
  tipo: z.string().trim().min(1, "Ingresá un tipo (ej. Talle)"),
  valor: z.string().trim().min(1, "Ingresá un valor (ej. M)"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
});

export const GENERO_VALUES = ["HOMBRE", "MUJER", "UNISEX"] as const;

export const usedProductSchema = z
  .object({
    nombre: z.string().trim().min(2, "Ingresá un nombre"),
    slug: z
      .string()
      .trim()
      .min(2, "Ingresá un slug")
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "El slug solo puede tener minúsculas, números y guiones",
      ),
    descripcion: z.string().trim().min(1, "Ingresá una descripción"),
    estadoConservacion: z.string().trim().nullable().optional(),
    precio: z.number().positive("El precio debe ser mayor a 0"),
    precioAnterior: z.number().positive().nullable().optional(),
    stock: z.number().int().min(0, "El stock no puede ser negativo"),
    genero: z.enum(GENERO_VALUES).nullable().optional(),
    categoryId: z.string().min(1, "Elegí una categoría"),
    brandId: z.string().min(1, "Elegí una marca"),
    destacado: z.boolean(),
    enOferta: z.boolean(),
    activo: z.boolean(),
    images: z
      .array(usedProductImageSchema)
      .min(1, "Agregá al menos una imagen"),
    variants: z.array(usedProductVariantSchema),
  })
  .refine((data) => !data.precioAnterior || data.precioAnterior > data.precio, {
    message: "El precio anterior debe ser mayor al precio actual",
    path: ["precioAnterior"],
  });

export type UsedProductFormValues = z.infer<typeof usedProductSchema>;
