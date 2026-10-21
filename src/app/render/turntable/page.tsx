import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TurntableCapture } from "./turntable-capture";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Herramienta interna: escena 3D a pantalla completa con ángulo controlable para que
 * scripts/3d/render-turntable.mjs capture el póster y la secuencia 360° del hero.
 * Solo existe con RENDER_TOOLS=1 (nunca en producción).
 */
export default function TurntablePage() {
  if (process.env.RENDER_TOOLS !== "1") notFound();
  return <TurntableCapture />;
}
