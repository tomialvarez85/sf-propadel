import { z } from "zod";

// null = hereda el descuento general de SiteSettings (ver src/lib/discounts.ts).
export const descuentoOverrideSchema = z
  .number()
  .int("Tiene que ser un número entero")
  .min(0, "No puede ser negativo")
  .max(100, "No puede ser mayor a 100")
  .nullable()
  .optional();
