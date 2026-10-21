import { NextResponse } from "next/server";
import { getAllVehicles } from "@/lib/inventory";
import { deliverLead, rateLimited } from "@/lib/leads";
import {
  APPOINTMENT_REASONS,
  APPOINTMENT_SLOTS,
  appointmentSchema,
} from "@/lib/validation/appointment";

/** POST /api/appointment — solicitud de cita previa. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados envíos seguidos. Inténtalo de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  const parsed = appointmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Revisa los campos del formulario.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true });

  const vehicle = d.vehicleId
    ? (await getAllVehicles()).find((v) => v.id === d.vehicleId)
    : undefined;
  const vehicleName = vehicle
    ? `${vehicle.brand} ${vehicle.model} ${vehicle.version} (${vehicle.year})`
    : undefined;

  try {
    await deliverLead({
      kind: "cita",
      subject: `Cita · ${APPOINTMENT_REASONS[d.reason]} · ${d.date} (${APPOINTMENT_SLOTS[d.slot]})`,
      replyTo: d.email,
      customerName: d.name,
      fields: [
        ["Motivo", APPOINTMENT_REASONS[d.reason]],
        ...(vehicleName ? ([["Vehículo", vehicleName]] as [string, string][]) : []),
        ["Fecha", d.date],
        ["Franja", APPOINTMENT_SLOTS[d.slot]],
        ["Nombre", `${d.name} ${d.lastName ?? ""}`.trim()],
        ["Email", d.email],
        ["Teléfono", d.phone],
        ["Comentarios", d.message || "—"],
        ["Acepta comunicaciones comerciales", d.marketing ? "Sí" : "No"],
        ["Consentimiento de privacidad", `Sí · ${new Date().toISOString()}`],
      ],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/appointment]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "No hemos podido registrar tu cita. Llámanos o escríbenos por WhatsApp.",
      },
      { status: 502 },
    );
  }
}
