import type { Metadata } from "next";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Pending } from "@/components/ui/pending";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedVehicles } from "@/lib/inventory";
import { cn } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Guía de estilo",
  robots: { index: false, follow: false },
};

const swatches = [
  ["--bg-primary", "Fondo"],
  ["--bg-secondary", "Fondo 2"],
  ["--bg-elevated", "Elevado"],
  ["--text-primary", "Texto"],
  ["--text-muted", "Texto secundario"],
  ["--text-subtle", "Texto terciario"],
  ["--accent", "Acento"],
  ["--accent-hover", "Acento hover"],
] as const;

export default async function StyleGuidePage() {
  const [sample] = await getFeaturedVehicles(1);

  return (
    <div>
      <section className="container-luxe pt-[calc(var(--header-h)+4rem)] pb-16">
        <p className="eyebrow mb-6">Sistema de diseño · Lujo silencioso</p>
        <h1 className="text-6xl">
          Guía de estilo
          <br />
          <em className="text-accent">Veloce Cars</em>
        </h1>
        <p className="mt-8 max-w-2xl text-muted">
          Archivo Expanded en versalitas para titulares, Manrope para el texto y acento platino.
          Tokens en <code className="text-fg">src/styles/tokens.css</code>.
        </p>
      </section>

      <section className="container-luxe border-t border-line py-16">
        <SectionHeading index="01" eyebrow="Color" title="Paleta" />
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {swatches.map(([token, label]) => (
            <li key={token} className="border border-line">
              <div className="h-24" style={{ background: `var(${token})` }} />
              <div className="p-3 text-xs">
                <p className="text-fg">{label}</p>
                <p className="font-mono text-subtle">{token}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-luxe border-t border-line py-16">
        <SectionHeading index="02" eyebrow="Tipografía" title="Escala fluida" />
        <div className="mt-10 space-y-6">
          {(
            [
              ["6xl", "text-6xl"],
              ["5xl", "text-5xl"],
              ["4xl", "text-4xl"],
              ["3xl", "text-3xl"],
              ["2xl", "text-2xl"],
            ] as const
          ).map(([size, className]) => (
            <div key={size} className="flex items-baseline gap-6 border-b border-line pb-6">
              <span className="w-12 shrink-0 font-mono text-xs text-subtle">{size}</span>
              <p className={cn("font-display leading-none", className)}>Ferrari 458 Italia</p>
            </div>
          ))}
          <p className="max-w-2xl text-lg text-muted">
            Cuerpo en Manrope. Nos encargamos de la tasación, el reportaje en estudio, la
            publicación, la atención a compradores y todos los trámites. Precio tabular:{" "}
            <span className="tabular text-fg">174.500 € · 76.000 km · 570 CV</span>
          </p>
        </div>
      </section>

      <section className="container-luxe border-t border-line py-16">
        <SectionHeading index="03" eyebrow="Componentes" title="Botones y marcadores" />
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <ButtonLink href="/vehiculos">Ver inventario</ButtonLink>
          <Button variant="solid">Reservar cita</Button>
          <Button variant="ghost">Vender mi coche</Button>
          <Button size="sm">Pequeño</Button>
          <Pending>dato del cliente</Pending>
        </div>
      </section>

      {sample && (
        <section className="container-luxe border-t border-line py-16">
          <SectionHeading index="04" eyebrow="Inventario" title="Tarjeta de vehículo" />
          <div className="mt-10 max-w-md">
            <VehicleCard vehicle={sample} />
          </div>
        </section>
      )}
    </div>
  );
}
