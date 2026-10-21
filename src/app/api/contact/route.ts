import { NextResponse } from "next/server";
import { deliverLead, rateLimited } from "@/lib/leads";
import { PREFERRED_CONTACT, contactSchema } from "@/lib/validation/contact";

/** POST /api/contact — solicitud de información (general o sobre un vehículo). */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados envíos seguidos. Inténtalo de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Revisa los campos del formulario.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;
  // Honeypot relleno: respondemos «ok» para no dar pistas al bot, pero no se envía nada.
  if (d.website) return NextResponse.json({ ok: true });

  try {
    await deliverLead({
      kind: "contacto",
      subject:
        d.topic === "financiacion"
          ? "Solicitud de financiación desde la web"
          : d.vehicleName
            ? `Interés en ${d.vehicleName}`
            : "Nueva consulta desde la web",
      replyTo: d.email,
      customerName: d.name,
      fields: [
        ["Nombre", `${d.name} ${d.lastName ?? ""}`.trim()],
        ["Email", d.email],
        ["Teléfono", d.phone],
        ["Prefiere contacto por", PREFERRED_CONTACT[d.preferredContact]],
        ...(d.vehicleName
          ? ([["Vehículo", `${d.vehicleName} (${d.vehicleId})`]] as [string, string][])
          : []),
        ["Mensaje", d.message],
        ["Acepta comunicaciones comerciales", d.marketing ? "Sí" : "No"],
        ["Consentimiento de privacidad", `Sí · ${new Date().toISOString()}`],
      ],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "No hemos podido enviar tu mensaje. Llámanos o escríbenos por WhatsApp.",
      },
      { status: 502 },
    );
  }
}
