export const INSTALLMENTS = 12;
export const LOW_STOCK_THRESHOLD = 3;
// Ajustar acá si cambia la alícuota de IVA — usado por el cálculo de
// "precio sin impuestos" en ProductPurchasePanel.
export const IVA_RATE = 0.21;

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDiscountPercent(
  precio: number,
  precioAnterior: number | null,
): number | null {
  if (precioAnterior === null || precioAnterior <= precio) return null;
  return Math.round(((precioAnterior - precio) / precioAnterior) * 100);
}
