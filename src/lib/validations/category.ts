import { z } from "zod";

export const categorySchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá un nombre"),
  slug: z
    .string()
    .trim()
    .min(2, "Ingresá un slug")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "El slug solo puede tener minúsculas, números y guiones",
    ),
  descripcion: z.string().trim().nullable().optional(),
  imagen: z.string().url().nullable().optional(),
  parentId: z.string().nullable().optional(),
  orden: z.number().int().min(0),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
