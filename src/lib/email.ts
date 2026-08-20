import { Resend } from "resend";

import { formatCurrency } from "@/lib/format";
import { COMPROBANTES_BUCKET } from "@/lib/storage-constants";
import { createAdminClient } from "@/lib/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

// onboarding@resend.dev is Resend's shared sandbox sender — works with no
// domain setup, but (until a real domain is verified, see README) can only
// deliver to the email address the Resend account itself was signed up
// with. Override via RESEND_FROM_EMAIL once a verified domain exists.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "SF ProPadel <onboarding@resend.dev>";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  comprobanteUrl: string | null;
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

// Resend caps a full email at 40MB including Base64-encoded attachments.
// Our own upload cap is 5MB (see storage-constants.ts) so this ceiling is
// mostly defensive — Base64 inflates size by ~33%, this leaves real margin
// under the 40MB limit even if that upload cap is ever raised.
const RESEND_ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;

type ComprobanteAttachment = { filename: string; content: Buffer };

/** Downloads a comprobante from the private bucket using the service role
 * key (see src/lib/supabase/admin.ts — no user session exists in this
 * server context, and the bucket's SELECT policy requires one). Never
 * throws: returns null on any failure (download error, oversized file) so
 * a broken attachment never blocks the email itself — callers fall back to
 * the /admin/pedidos link already in the email body. */
async function fetchComprobanteAttachment(
  path: string,
): Promise<ComprobanteAttachment | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(COMPROBANTES_BUCKET)
      .download(path);

    if (error || !data) {
      throw error ?? new Error("Descarga vacía.");
    }

    const content = Buffer.from(await data.arrayBuffer());
    if (content.byteLength > RESEND_ATTACHMENT_MAX_BYTES) {
      console.warn(
        `Comprobante ${path} supera el límite de adjunto (${content.byteLength} bytes) — se envía el mail solo con el link.`,
      );
      return null;
    }

    return { filename: path.split("/").pop() || "comprobante", content };
  } catch (error) {
    console.error(
      `No se pudo descargar el comprobante ${path} para adjuntarlo al mail:`,
      error,
    );
    return null;
  }
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

  const attachment = order.comprobanteUrl
    ? await fetchComprobanteAttachment(order.comprobanteUrl)
    : null;

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

    ${
      order.comprobanteUrl
        ? `<p style="margin:20px 0 0;font-size:13px;color:${INK};">
            ${attachment ? "El comprobante de pago está adjunto a este mail." : "El comprobante es grande para adjuntar — abrilo desde el panel."}
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            <tr>
              <td style="background-color:${TEAL};border-radius:8px;">
                <a href="${SITE_URL}/admin/pedidos" style="display:inline-block;padding:12px 20px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Ver comprobante en el panel</a>
              </td>
            </tr>
          </table>`
        : `<p style="margin:20px 0 0;font-size:13px;color:${INK_MUTED};">El cliente todavía no subió el comprobante de pago.</p>`
    }

    <p style="margin:24px 0 0;font-size:12px;color:${INK_MUTED};">
      Pedido #${order.id} · ${order.createdAt.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
    </p>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Nuevo pedido de ${order.nombreCliente} — ${formatCurrency(order.total)} (pendiente de pago)`,
      html: emailShellHtml("Nuevo pedido — pendiente de pago", body),
      attachments: attachment
        ? [{ filename: attachment.filename, content: attachment.content }]
        : undefined,
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
  const pedidoHref = `${SITE_URL}/pedido/${order.id}`;

  const body = `
    <p style="margin:0 0 8px;font-size:16px;color:${INK};">Hola ${order.nombreCliente}, ¡gracias por tu pedido!</p>
    <p style="margin:0;font-size:14px;color:${INK_MUTED};">Este es el resumen:</p>

    ${itemsTableHtml(order.items)}
    ${paymentInfoHtml(payment)}

    <p style="margin:20px 0 0;font-size:14px;color:${INK};">
      Transferí el total y subí el comprobante de pago para confirmar tu pedido más rápido.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="background-color:${TEAL};border-radius:8px;">
          <a href="${pedidoHref}" style="display:inline-block;padding:12px 20px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Subir comprobante de pago</a>
        </td>
      </tr>
    </table>

    ${
      whatsappHref
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;">
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

export type ReceiptUploadedNotice = {
  id: string;
  nombreCliente: string;
  comprobanteUrl: string;
};

/** Follow-up notice for when a comprobante is uploaded AFTER order
 * creation (via /pedido/[orderId]) — the owner already got the full order
 * detail in sendOrderNotificationEmail, so this is deliberately just the
 * "go check" nudge (+ attachment), not a resend of the whole order. */
export async function sendReceiptUploadedEmail(
  order: ReceiptUploadedNotice,
  recipientEmail: string | null | undefined,
): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY no está configurada — no se envió el aviso de comprobante subido.");
    return { success: false, error: "Falta configurar el envío de emails." };
  }

  if (!recipientEmail) {
    console.error(
      "No hay emailPedidos configurado en SiteSettings — no se envió el aviso de comprobante subido.",
    );
    return {
      success: false,
      error: "Falta configurar el email de notificación de pedidos en /admin/configuracion.",
    };
  }

  const attachment = await fetchComprobanteAttachment(order.comprobanteUrl);

  const body = `
    <p style="margin:0 0 8px;font-size:16px;color:${INK};">
      <strong>${order.nombreCliente}</strong> subió el comprobante de pago de un pedido pendiente.
    </p>
    <p style="margin:0;font-size:13px;color:${INK_MUTED};">
      ${attachment ? "Lo encontrás adjunto a este mail." : "El archivo es grande para adjuntar — abrilo desde el panel."}
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="background-color:${TEAL};border-radius:8px;">
          <a href="${SITE_URL}/admin/pedidos" style="display:inline-block;padding:12px 20px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Ver pedido en el panel</a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:12px;color:${INK_MUTED};">Pedido #${order.id}</p>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `${order.nombreCliente} subió el comprobante de pago — pedido #${order.id.slice(-8)}`,
      html: emailShellHtml("Comprobante subido", body),
      attachments: attachment
        ? [{ filename: attachment.filename, content: attachment.content }]
        : undefined,
    });

    if (error) {
      console.error("Resend devolvió un error al enviar el aviso de comprobante subido:", error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error(
      `No se pudo enviar el aviso de comprobante subido (pedido ${order.id}):`,
      error,
    );
    return { success: false, error: "No se pudo enviar el email." };
  }

  return { success: true };
}
