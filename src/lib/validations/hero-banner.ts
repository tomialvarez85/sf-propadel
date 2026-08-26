import { z } from "zod";

export const heroBannerSchema = z.object({
  imagen: z.string().min(1, "Subí una imagen"),
  link: z.string().trim().nullable().optional(),
  titulo: z.string().trim().nullable().optional(),
});

export type HeroBannerFormValues = z.infer<typeof heroBannerSchema>;
