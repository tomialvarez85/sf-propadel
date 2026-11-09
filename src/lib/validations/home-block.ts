import { z } from "zod";

export const homeBlockSchema = z
  .object({
    tipo: z.enum(["BANNER", "TILE"]),
    titulo: z.string().trim().max(80, "Máximo 80 caracteres").optional(),
    imagen: z.string().trim().min(1, "Subí una imagen"),
    imagenMobile: z.string().trim().nullable().optional(),
    link: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          !value || value.startsWith("/") || /^https?:\/\//.test(value),
        "El link tiene que empezar con / (página del sitio) o con https://",
      ),
    activo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "TILE" && !data.titulo) {
      ctx.addIssue({
        code: "custom",
        path: ["titulo"],
        message: "Ingresá el texto de la tarjeta",
      });
    }
    if (data.tipo === "TILE" && !data.link) {
      ctx.addIssue({
        code: "custom",
        path: ["link"],
        message: "Ingresá a dónde lleva la tarjeta",
      });
    }
  });

export type HomeBlockFormValues = z.infer<typeof homeBlockSchema>;
