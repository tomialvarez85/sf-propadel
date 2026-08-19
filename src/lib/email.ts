import { Resend } from "resend";

import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// onboarding@resend.dev is Resend's shared sandbox sender — works with no
// domain setup, but (until a real domain is verified, see README) can only
// deliver to the email address the Resend account itself was signed up
// with. Override via RESEND_FROM_EMAIL once a verified domain exists.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "SF ProPadel <onboarding@resend.dev>";

const TEAL = "#0e5865";
const INK = "#0a0a0a";
const INK_MUTED = "#737373";
const BORDER = "#e5e5e5";
const SURFACE_MUTED = "#f5f5f5";

export type OrderItemForEmail = {
  nombreProducto: string;
  variante: string | null;
  cantidad: number;
  precioUnitario: number;
};

export type OrderForEmail = {
  id: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string | null;
  total: number;
  createdAt: Date;
  items: OrderItemForEmail[];
};

function buildOrderEmailHtml(order: OrderForEmail): string {
  const itemRows = order.items
    .map((item) => {
      const subtotal = item.precioUnitario * item.cantidad;
      return `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};">
            ${item.nombreProducto}${item.variante ? `<br><span style="color:${INK_MUTED};font-size:12px;">${item.variante}</span>` : ""}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};text-align:center;">${item.cantidad}</td>
          <td style="padding:12px 8px;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};text-align:right;">${formatCurrency(item.precioUnitario)}</td>
          <td style="padding:12px 8px;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};text-align:right;font-weight:600;">${formatCurrency(subtotal)}</td>
        </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:${SURFACE_MUTED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SURFACE_MUTED};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:${TEAL};padding:20px 24px;">
                <span style="color:#ffffff;font-size:18px;font-weight:800;">SFProPadel</span>
                <span style="color:#ffffff;opacity:0.8;font-size:13px;display:block;margin-top:2px;">Nuevo pedido recibido</span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 4px;font-size:13px;color:${INK_MUTED};">Cliente</p>
                <p style="margin:0 0 2px;font-size:16px;color:${INK};font-weight:700;">${order.nombreCliente}</p>
                <p style="margin:0;font-size:14px;color:${INK_MUTED};">${order.emailCliente}${order.telefonoCliente ? ` · ${order.telefonoCliente}` : ""}</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse;">
                  <thead>
                    <tr>
                      <th align="left" style="padding:0 8px 8px;font-size:12px;color:${INK_MUTED};border-bottom:2px solid ${INK};">Producto</th>
                      <th align="center" style="padding:0 8px 8px;font-size:12px;color:${INK_MUTED};border-bottom:2px solid ${INK};">Cant.</th>
                      <th align="right" style="padding:0 8px 8px;font-size:12px;color:${INK_MUTED};border-bottom:2px solid ${INK};">Precio</th>
                      <th align="right" style="padding:0 8px 8px;font-size:12px;color:${INK_MUTED};border-bottom:2px solid ${INK};">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRows}
                  </tbody>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                  <tr>
                    <td align="right" style="font-size:14px;color:${INK_MUTED};padding-right:8px;">Total</td>
                    <td align="right" style="font-size:20px;color:${TEAL};font-weight:800;width:1%;white-space:nowrap;">${formatCurrency(order.total)}</td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;font-size:12px;color:${INK_MUTED};">
                  Pedido #${order.id} · ${order.createdAt.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOrderNotificationEmail(
  order: OrderForEmail,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY no está configurada — no se envió el mail de pedido.");
    return { success: false, error: "Falta configurar el envío de emails." };
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const to = settings?.emailPedidos;

  if (!to) {
    console.error(
      "No hay emailPedidos configurado en SiteSettings — no se envió el mail de pedido.",
    );
    return {
      success: false,
      error: "Falta configurar el email de notificación de pedidos en /admin/configuracion.",
    };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Nuevo pedido de ${order.nombreCliente} — ${formatCurrency(order.total)}`,
      html: buildOrderEmailHtml(order),
    });

    if (error) {
      console.error("Resend devolvió un error al enviar el mail de pedido:", error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error("No se pudo enviar el mail de notificación de pedido:", error);
    return { success: false, error: "No se pudo enviar el email." };
  }

  return { success: true };
}
