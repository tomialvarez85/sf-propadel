import { z } from "zod";

export const brandSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá un nombre"),
  slug: z
    .string()
    .trim()
    .min(2, "Ingresá un slug")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "El slug solo puede tener minúsculas, números y guiones",
    ),
  logo: z.string().url().nullable().optional(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
