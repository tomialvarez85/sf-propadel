import { Resend } from "resend";

import { formatCurrency } from "@/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY);

// onboarding@resend.dev is Resend's shared sandbox sender — works with no
// domain setup, but (until a real domain is verified, see README) can only
// deliver to the email address the Resend account itself was signed up
// with. Override via RESEND_FROM_EMAIL once a verified domain exists.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "SF ProPadel <onboarding@resend.dev>";

const TEAL = "#0e5865";
const LIME = "#bccd0f";
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

export type PaymentInfo = {
  alias: string | null;
  cbu: string | null;
  titular: string | null;
  banco: string | null;
};

type SendResult = { success: true } | { success: false; error: string };

function hasPaymentInfo(payment: PaymentInfo): boolean {
  return Boolean(payment.alias || payment.cbu || payment.titular || payment.banco);
}

function itemsTableHtml(items: OrderItemForEmail[]): string {
  const rows = items
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
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left" style="padding:0 8px 8px;font-size:12px;color:${INK_MUTED};border-bottom:2px solid ${INK};">Producto</th>
          <th align="center" style="padding:0 8px 8px;font-size:12px;color:${INK_MUTED};border-bottom:2px solid ${INK};">Cant.</th>
          <th align="right" style="padding:0 8px 8px;font-size:12px;color:${INK_MUTED};border-bottom:2px solid ${INK};">Precio</th>
          <th align="right" style="padding:0 8px 8px;font-size:12px;color:${INK_MUTED};border-bottom:2px solid ${INK};">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td align="right" style="font-size:14px;color:${INK_MUTED};padding-right:8px;">Total</td>
        <td align="right" style="font-size:20px;color:${TEAL};font-weight:800;width:1%;white-space:nowrap;">${formatCurrency(items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0))}</td>
      </tr>
    </table>`;
}

function paymentInfoHtml(payment: PaymentInfo): string {
  if (!hasPaymentInfo(payment)) return "";

  const rows = [
    ["Alias", payment.alias],
    ["CBU / CVU", payment.cbu],
    ["Titular", payment.titular],
    ["Banco", payment.banco],
  ]
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:4px 0;font-size:12px;color:${INK_MUTED};">${label}</td>
          <td style="padding:4px 0;font-size:15px;color:${INK};font-weight:700;text-align:right;">${value}</td>
        </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:${SURFACE_MUTED};border-radius:8px;padding:16px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:13px;color:${INK};font-weight:700;">Datos para transferir</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td>
      </tr>
    </table>`;
}

function emailShellHtml(headerLabel: string, bodyHtml: string): string {
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
                <span style="color:#ffffff;opacity:0.8;font-size:13px;display:block;margin-top:2px;">${headerLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">${bodyHtml}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Notifies the store owner — includes an explicit PENDIENTE DE PAGO flag
 * (subject + body) so it's clear the transfer hasn't been confirmed yet and
 * the order isn't ready to prepare/ship. */
export async function sendOrderNotificationEmail(
  order: OrderForEmail,
  recipientEmail: string | null | undefined,
): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY no está configurada — no se envió el mail de pedido.");
    return { success: false, error: "Falta configurar el envío de emails." };
  }

  if (!recipientEmail) {
    console.error(
      "No hay emailPedidos configurado en SiteSettings — no se envió el mail de pedido.",
    );
    return {
      success: false,
      error: "Falta configurar el email de notificación de pedidos en /admin/configuracion.",
    };
  }

  const body = `
    <p style="margin:0 0 4px;font-size:13px;color:${INK_MUTED};">Cliente</p>
    <p style="margin:0 0 2px;font-size:16px;color:${INK};font-weight:700;">${order.nombreCliente}</p>
    <p style="margin:0;font-size:14px;color:${INK_MUTED};">${order.emailCliente}${order.telefonoCliente ? ` · ${order.telefonoCliente}` : ""}</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="background-color:${LIME};color:${INK};font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;">PENDIENTE DE PAGO</td>
      </tr>
    </table>
    <p style="margin:8px 0 0;font-size:13px;color:${INK_MUTED};">
      Todavía no confirmó la transferencia — no prepares el envío hasta verificar el pago y pasar el pedido a Confirmado en /admin/pedidos.
    </p>

    ${itemsTableHtml(order.items)}

    <p style="margin:24px 0 0;font-size:12px;color:${INK_MUTED};">
      Pedido #${order.id} · ${order.createdAt.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
    </p>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Nuevo pedido de ${order.nombreCliente} — ${formatCurrency(order.total)} (pendiente de pago)`,
      html: emailShellHtml("Nuevo pedido — pendiente de pago", body),
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

/** Sent to the customer right after checkout — order summary + transfer
 * details, so the payment instructions survive even if they lose the
 * on-screen confirmation. Same content as that screen, doesn't depend on it. */
export async function sendOrderConfirmationEmail(
  order: OrderForEmail,
  payment: PaymentInfo,
  whatsapp: string | null | undefined,
): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY no está configurada — no se envió el mail de confirmación.");
    return { success: false, error: "Falta configurar el envío de emails." };
  }

  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola! Te mando el comprobante de mi pedido de ${formatCurrency(order.total)}.`,
      )}`
    : null;

  const body = `
    <p style="margin:0 0 8px;font-size:16px;color:${INK};">Hola ${order.nombreCliente}, ¡gracias por tu pedido!</p>
    <p style="margin:0;font-size:14px;color:${INK_MUTED};">Este es el resumen:</p>

    ${itemsTableHtml(order.items)}
    ${paymentInfoHtml(payment)}

    <p style="margin:20px 0 0;font-size:14px;color:${INK};">
      Transferí el total y mandanos el comprobante por WhatsApp para confirmar tu pedido más rápido.
    </p>

    ${
      whatsappHref
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr>
              <td style="background-color:#25D366;border-radius:8px;">
                <a href="${whatsappHref}" style="display:inline-block;padding:12px 20px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Enviar comprobante por WhatsApp</a>
              </td>
            </tr>
          </table>`
        : ""
    }

    <p style="margin:24px 0 0;font-size:12px;color:${INK_MUTED};">
      Pedido #${order.id} · ${order.createdAt.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
    </p>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.emailCliente,
      subject: `Confirmamos tu pedido — ${formatCurrency(order.total)}`,
      html: emailShellHtml("Pedido confirmado", body),
    });

    if (error) {
      console.error(
        `Resend devolvió un error al enviar la confirmación al cliente (pedido ${order.id}):`,
        error,
      );
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error(
      `No se pudo enviar el mail de confirmación al cliente (pedido ${order.id}):`,
      error,
    );
    return { success: false, error: "No se pudo enviar el email." };
  }

  return { success: true };
}
