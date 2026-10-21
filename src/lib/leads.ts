import "server-only";
import { Resend } from "resend";
import { site } from "./site";

/**
 * Entrega de solicitudes (leads): email al concesionario + acuse al cliente vía Resend y,
 * opcionalmente, webhook (n8n / CRM). Variables en .env.example.
 * Sin RESEND_API_KEY en desarrollo se registra en consola; en producción se considera error.
 */
export type Lead = {
  kind: "contacto" | "tasacion" | "cita";
  subject: string;
  replyTo: string;
  customerName: string;
  fields: [label: string, value: string][];
  /** Adjuntos del email (fotos de la tasación). No se envían al webhook. */
  attachments?: { filename: string; content: Buffer }[];
};

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

function table(fields: Lead["fields"]) {
  return `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${fields
    .map(
      ([k, v]) =>
        `<tr><td style="color:#666;vertical-align:top">${escape(k)}</td><td>${escape(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;
}

export async function deliverLead(lead: Lead): Promise<{ delivered: boolean }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL ?? "web@velocecars.es";
  const to = process.env.CONTACT_TO_EMAIL ?? site.contact.email;

  const webhook = process.env.LEADS_WEBHOOK_URL;
  if (webhook) {
    // El webhook no debe bloquear ni hacer fallar el envío principal.
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: lead.kind,
        subject: lead.subject,
        replyTo: lead.replyTo,
        fields: Object.fromEntries(lead.fields),
        attachments: lead.attachments?.length ?? 0,
        receivedAt: new Date().toISOString(),
      }),
    }).catch((err) => console.error("[leads] webhook", err));
  }

  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY no configurada: el formulario no puede enviar emails");
    }
    console.info(
      "[leads] (sin RESEND_API_KEY, no se envía email)",
      lead.subject,
      lead.fields,
      lead.attachments?.length ?? 0,
    );
    return { delivered: false };
  }

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: `Web Veloce Cars <${from}>`,
    to: [to],
    replyTo: lead.replyTo,
    subject: lead.subject,
    html: `<h2 style="font-family:Arial,sans-serif">${escape(lead.subject)}</h2>${table(lead.fields)}`,
    attachments: lead.attachments,
  });
  if (error) throw new Error(`Resend: ${error.message}`);

  // Acuse de recibo al cliente (no crítico).
  await resend.emails
    .send({
      from: `Veloce Cars <${from}>`,
      to: [lead.replyTo],
      subject: "Hemos recibido tu solicitud · Veloce Cars",
      html: `<p style="font-family:Arial,sans-serif">Hola ${escape(lead.customerName)},</p>
<p style="font-family:Arial,sans-serif">Gracias por escribirnos. Hemos recibido tu solicitud y te contestaremos lo antes posible.</p>
<p style="font-family:Arial,sans-serif">${escape(site.name)} · ${escape(site.address.street)}, ${escape(site.address.city)} · ${escape(site.contact.phone.display)}</p>`,
    })
    .catch((err) => console.error("[leads] acuse", err));

  return { delivered: true };
}

/**
 * Límite básico por IP (memoria del proceso): suficiente contra abusos simples; en
 * producción con varias instancias conviene un almacén compartido (Upstash, etc.).
 */
const hits = new Map<string, number[]>();
const LOOPBACK = new Set(["local", "::1", "127.0.0.1", "::ffff:127.0.0.1"]);
export function rateLimited(ip: string, max = 5, windowMs = 10 * 60_000) {
  // Peticiones locales (desarrollo y tests) no se limitan; en producción llega la IP real del proxy.
  if (LOOPBACK.has(ip)) return false;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}
