import { z } from "zod";

export const siteSettingsSchema = z.object({
  whatsapp: z.string().trim().nullable().optional(),
  instagram: z.string().trim().nullable().optional(),
  facebook: z.string().trim().nullable().optional(),
  email: z.string().trim().nullable().optional(),
  direccion: z.string().trim().nullable().optional(),
  textoEnvioGratis: z.string().trim().nullable().optional(),
  textoCuotas: z.string().trim().nullable().optional(),
  textoNosotros: z.string().trim().nullable().optional(),
  imagenGeneroHombre: z.string().url().nullable().optional(),
  imagenGeneroMujer: z.string().url().nullable().optional(),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;
