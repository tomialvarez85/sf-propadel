import { z } from "zod";

export const bannerSchema = z.object({
  imagen: z.string().min(1, "Subí una imagen"),
  link: z.string().trim().nullable().optional(),
  titulo: z.string().trim().nullable().optional(),
  activo: z.boolean(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;
