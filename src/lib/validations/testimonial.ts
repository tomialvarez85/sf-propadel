import { z } from "zod";

export const testimonialSchema = z.object({
  nombreCliente: z.string().trim().min(2, "Ingresá el nombre del cliente"),
  comentario: z.string().trim().min(10, "Ingresá el comentario del cliente"),
  avatarUrl: z.string().trim().nullable().optional(),
  activo: z.boolean(),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;
