import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PedidoCheckoutPanel } from "@/components/site/pedido-checkout-panel";
import { formatCurrency } from "@/lib/format";
import { getPublicOrder } from "@/lib/order-public";
import { getSiteSettings } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tu pedido | SF ProPadel",
};

// Step 2 of checkout — the ONLY place a comprobante gets attached to an
// Order and the owner notification email fires (see finalizeOrder in
// (site)/actions.ts). Step 1 (cart-sheet.tsx) only creates the Order and
// redirects here; if the customer never returns, this Order just sits
// PENDIENTE with no comprobante and nobody was emailed — but the link
// keeps working whenever they come back to it.
export default async function PedidoPage(
  props: PageProps<"/pedido/[orderId]">,
) {
  const { orderId } = await props.params;
  const [order, settings] = await Promise.all([
    getPublicOrder(orderId),
    getSiteSettings(),
  ]);

  if (!order) {
    notFound();
  }

  // Usados no tienen descuento por transferencia — solo se descuenta la
  // porción del pedido que corresponde a ítems NUEVO (snapshot por ítem,
  // no un join en vivo a Product — ver comentario en schema.prisma).
  const descuentoTransferencia = settings?.descuentoTransferencia ?? null;
  const montoDescontable = order.items
    .filter((item) => item.condicion !== "USADO")
    .reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);
  const tieneDescuento =
    !!descuentoTransferencia && descuentoTransferencia > 0 && montoDescontable > 0;
  const totalConDescuento = tieneDescuento
    ? order.total - montoDescontable * (descuentoTransferencia! / 100)
    : order.total;

  const paymentFields = [
    { label: "Alias", value: settings?.alias, copyable: true },
    { label: "CBU / CVU", value: settings?.cbu, copyable: true },
    { label: "Titular", value: settings?.titular, copyable: false },
    { label: "Banco", value: settings?.banco, copyable: false },
  ].filter(
    (field): field is { label: string; value: string; copyable: boolean } =>
      Boolean(field.value),
  );

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="font-heading text-xl font-extrabold tracking-[-0.02em]">
        Hola {order.nombreCliente}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Pedido #{order.id.slice(-8)} ·{" "}
        {new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(
          order.createdAt,
        )}
      </p>

      <div className="border-border mt-6 flex flex-col gap-2 border-t pt-4">
        <p className="text-sm font-semibold">Resumen del pedido</p>
        <ul className="flex flex-col gap-2">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <span className="flex-1 truncate">
                {item.nombreProducto}
                {item.variante && (
                  <span className="text-muted-foreground"> ({item.variante})</span>
                )}{" "}
                <span className="text-muted-foreground">x{item.cantidad}</span>
              </span>
              <span className="shrink-0 font-medium">
                {formatCurrency(item.precioUnitario * item.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-center justify-between border-t pt-2 text-sm font-semibold">
          <span>Total</span>
          <span
            className={cn(
              "font-heading text-lg font-extrabold",
              tieneDescuento && "text-muted-foreground line-through",
            )}
          >
            {formatCurrency(order.total)}
          </span>
        </div>
        {tieneDescuento && (
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-primary">
              Total con descuento por transferencia ({descuentoTransferencia}%)
            </span>
            <span className="font-heading text-primary text-lg font-extrabold">
              {formatCurrency(totalConDescuento)}
            </span>
          </div>
        )}
      </div>

      <PedidoCheckoutPanel
        orderId={order.id}
        paymentFields={paymentFields}
        alreadyFinalized={Boolean(order.comprobanteSubidoEn)}
      />
    </div>
  );
}
