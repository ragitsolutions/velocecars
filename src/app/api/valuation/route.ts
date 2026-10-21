import { NextResponse } from "next/server";
import { deliverLead, rateLimited } from "@/lib/leads";
import { formatKm } from "@/lib/utils/format";
import {
  MAX_PHOTOS,
  MAX_PHOTOS_TOTAL_BYTES,
  MAX_PHOTO_BYTES,
  valuationSchema,
} from "@/lib/validation/valuation";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/**
 * POST /api/valuation — tasación. multipart/form-data: `data` (JSON del formulario) y
 * `photos` (0–10 imágenes, ya comprimidas en el navegador) que se adjuntan al email.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados envíos seguidos. Inténtalo de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  const form = await request.formData().catch(() => null);
  let raw: unknown = null;
  try {
    raw = JSON.parse(String(form?.get("data") ?? ""));
  } catch {
    /* se valida abajo */
  }
  const parsed = valuationSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Revisa los campos del formulario.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true });

  const photos = (form?.getAll("photos") ?? []).filter((f): f is File => f instanceof File);
  if (
    photos.length > MAX_PHOTOS ||
    photos.reduce((sum, f) => sum + f.size, 0) > MAX_PHOTOS_TOTAL_BYTES ||
    photos.some((f) => f.size > MAX_PHOTO_BYTES || !ALLOWED_TYPES.has(f.type))
  ) {
    return NextResponse.json(
      { ok: false, error: `Sube como máximo ${MAX_PHOTOS} fotos JPG, PNG o WebP (4 MB en total).` },
      { status: 400 },
    );
  }

  const vehicle = `${d.brand} ${d.model}${d.version ? ` ${d.version}` : ""} (${d.year})`;
  try {
    await deliverLead({
      kind: "tasacion",
      subject: `Tasación · ${vehicle} · ${formatKm(d.mileageKm)}`,
      replyTo: d.email,
      customerName: d.name,
      fields: [
        ["Tipo", d.vehicleType === "turismo" ? "Turismo" : "Vehículo industrial"],
        ["Vehículo", vehicle],
        ["Matrícula", d.plate || "—"],
        ["Kilómetros", formatKm(d.mileageKm)],
        ["Combustible", d.fuel],
        ["Cambio", d.transmission],
        ["Color", d.color || "—"],
        ["Estado", d.condition],
        ["Detalles", d.notes || "—"],
        ["Fotos", String(photos.length)],
        ["Nombre", `${d.name} ${d.lastName ?? ""}`.trim()],
        ["Email", d.email],
        ["Teléfono", d.phone],
        ["Acepta comunicaciones comerciales", d.marketing ? "Sí" : "No"],
        ["Consentimiento de privacidad", `Sí · ${new Date().toISOString()}`],
      ],
      attachments: await Promise.all(
        photos.map(async (f, i) => ({
          filename: `foto-${i + 1}-${f.name}`.replace(/[^\w.-]/g, "_"),
          content: Buffer.from(await f.arrayBuffer()),
        })),
      ),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/valuation]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "No hemos podido enviar tu tasación. Llámanos o escríbenos por WhatsApp.",
      },
      { status: 502 },
    );
  }
}
