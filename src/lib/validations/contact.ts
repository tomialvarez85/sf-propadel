import { z } from "zod";

export const contactFormSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu email")
    .email("Ingresá un email válido"),
  mensaje: z.string().trim().min(10, "Contanos un poco más"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
