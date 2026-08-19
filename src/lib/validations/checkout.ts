import { z } from "zod";

export const checkoutFormSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu email")
    .email("Ingresá un email válido"),
  telefono: z.string().trim().nullable().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
