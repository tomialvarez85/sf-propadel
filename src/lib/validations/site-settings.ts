import { z } from "zod";

export const siteSettingsSchema = z.object({
  whatsapp: z.string().trim().nullable().optional(),
  instagram: z.string().trim().nullable().optional(),
  email: z.string().trim().nullable().optional(),
  emailPedidos: z.string().trim().nullable().optional(),
  direccion: z.string().trim().nullable().optional(),
  horarioAtencion: z.string().trim().nullable().optional(),
  textoEnvioGratis: z.string().trim().nullable().optional(),
  textoCuotas: z.string().trim().nullable().optional(),
  textoNosotros: z.string().trim().nullable().optional(),
  alias: z.string().trim().nullable().optional(),
  cbu: z.string().trim().nullable().optional(),
  titular: z.string().trim().nullable().optional(),
  banco: z.string().trim().nullable().optional(),
  cantidadCuotas: z.number().int().min(1, "Tiene que ser al menos 1 cuota"),
  cuotasSinInteres: z.boolean(),
  descuentoTransferencia: z
    .number()
    .int()
    .min(0, "No puede ser negativo")
    .max(100, "No puede ser mayor a 100")
    .nullable()
    .optional(),
  mostrarPrecioSinImpuestos: z.boolean(),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;
