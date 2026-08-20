import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComprobanteUploader } from "@/components/site/comprobante-uploader";
import { CopyField } from "@/components/site/copy-field";
import { formatCurrency } from "@/lib/format";
import { getPublicOrder } from "@/lib/order-public";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Tu pedido | SF ProPadel",
};

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

  const paymentFields = [
    { label: "Alias", value: settings?.alias },
    { label: "CBU / CVU", value: settings?.cbu },
    { label: "Titular", value: settings?.titular },
    { label: "Banco", value: settings?.banco },
  ].filter((field): field is { label: string; value: string } =>
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
          <span className="font-heading text-lg font-extrabold">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {paymentFields.length > 0 && (
        <div className="bg-muted mt-4 flex flex-col gap-1 rounded-lg p-3">
          <p className="text-sm font-semibold">Datos para transferir</p>
          <div className="divide-border divide-y">
            {paymentFields.map((field) => (
              <CopyField key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>
      )}

      <ComprobanteUploader
        orderId={order.id}
        uploadedAt={order.comprobanteSubidoEn}
      />
    </div>
  );
}
