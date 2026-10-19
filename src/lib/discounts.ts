/**
 * Resolves the effective discount percent (transferencia or efectivo) for
 * one product: the product's own override wins when set — including an
 * explicit 0, which means "this product has no discount" — otherwise it
 * falls back to the global value from SiteSettings.
 *
 * Usados only ever get a discount through their own override: the global
 * fallback deliberately doesn't reach them (same rule /pedido/[orderId]
 * always applied), so turning on a store-wide discount never silently
 * discounts used gear the owner priced by hand.
 *
 * Returns null when there's no discount to show (null, 0 or negative).
 */
export function resolveDescuento(
  override: number | null | undefined,
  global: number | null | undefined,
  condicion: "NUEVO" | "USADO",
): number | null {
  const percent =
    override != null ? override : condicion === "USADO" ? null : global;
  return percent != null && percent > 0 ? Math.min(percent, 100) : null;
}

export function applyDescuento(precio: number, percent: number) {
  return precio * (1 - percent / 100);
}
