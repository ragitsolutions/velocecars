import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/ui/link";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { getAllVehicles } from "@/lib/inventory";
import type { Vehicle } from "@/lib/inventory/types";
import { vehicleHref } from "@/lib/inventory/urls";
import { cn, formatKm, formatNumber, formatPower, formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Comparar vehículos",
  robots: { index: false, follow: true },
};

type Row = {
  label: string;
  value: (v: Vehicle) => string | undefined;
  /** Valor numérico para destacar el mejor (menor o mayor según `best`). */
  score?: (v: Vehicle) => number | undefined;
  best?: "min" | "max";
};

const ROWS: Row[] = [
  { label: "Precio", value: (v) => formatPrice(v.price), score: (v) => v.price, best: "min" },
  { label: "Año", value: (v) => String(v.year), score: (v) => v.year, best: "max" },
  {
    label: "Kilómetros",
    value: (v) => formatKm(v.mileageKm),
    score: (v) => v.mileageKm,
    best: "min",
  },
  {
    label: "Potencia",
    value: (v) => (v.powerCv ? formatPower(v.powerCv) : undefined),
    score: (v) => v.powerCv || undefined,
    best: "max",
  },
  {
    label: "0-100 km/h",
    value: (v) =>
      v.acceleration0100 ? `${String(v.acceleration0100).replace(".", ",")} s` : undefined,
    score: (v) => v.acceleration0100,
    best: "min",
  },
  {
    label: "Velocidad máxima",
    value: (v) => (v.topSpeedKmh ? `${formatNumber(v.topSpeedKmh)} km/h` : undefined),
    score: (v) => v.topSpeedKmh,
    best: "max",
  },
  { label: "Combustible", value: (v) => v.fuel },
  { label: "Cambio", value: (v) => v.transmission },
  { label: "Carrocería", value: (v) => v.bodyType },
  { label: "Tracción", value: (v) => v.drivetrain },
  { label: "Motor", value: (v) => v.engine },
  { label: "Consumo mixto", value: (v) => v.consumption },
  { label: "Emisiones", value: (v) => v.emissions },
  { label: "Etiqueta DGT", value: (v) => v.emissionLabel },
  { label: "Color", value: (v) => v.color },
  {
    label: "Puertas / plazas",
    value: (v) => (v.doors && v.seats ? `${v.doors} / ${v.seats}` : undefined),
  },
  { label: "Peso", value: (v) => (v.weightKg ? `${formatNumber(v.weightKg)} kg` : undefined) },
  {
    label: "Garantía",
    value: (v) =>
      v.warrantyMonths
        ? `${v.warrantyMonths} meses${v.warrantyOfficial ? " (oficial)" : ""}`
        : undefined,
    score: (v) => v.warrantyMonths,
    best: "max",
  },
];

function bestIds(vehicles: Vehicle[], row: Row) {
  if (!row.score || vehicles.length < 2) return new Set<string>();
  const scored = vehicles
    .map((v) => ({ id: v.id, s: row.score!(v) }))
    .filter((x): x is { id: string; s: number } => typeof x.s === "number");
  if (scored.length < 2) return new Set<string>();
  const target =
    row.best === "min" ? Math.min(...scored.map((x) => x.s)) : Math.max(...scored.map((x) => x.s));
  return new Set(scored.filter((x) => x.s === target).map((x) => x.id));
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids = "" } = await searchParams;
  const all = await getAllVehicles();
  const byId = new Map(all.map((v) => [v.id, v]));
  const vehicles = ids
    .split(",")
    .map((id) => byId.get(id))
    .filter((v): v is Vehicle => Boolean(v))
    .slice(0, 3);

  return (
    <section className="container-luxe pt-[calc(var(--header-h)+3rem)] pb-[var(--section-y)]">
      <Link
        href="/vehiculos"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden /> Volver al inventario
      </Link>
      <p className="eyebrow mb-4">Comparador</p>
      <h1 className="mb-12 text-5xl">Comparar vehículos</h1>

      {vehicles.length < 2 ? (
        <div className="border border-line p-10 text-muted">
          <p>Selecciona al menos dos vehículos con el botón de comparar de las tarjetas.</p>
          <ButtonLink href="/vehiculos" className="mt-6">
            Ir al inventario
          </ButtonLink>
        </div>
      ) : (
        <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)]">
          <table className="tabular w-full min-w-[40rem] table-fixed border-collapse text-sm">
            <caption className="sr-only">
              Comparativa de {vehicles.map((v) => `${v.brand} ${v.model}`).join(", ")}
            </caption>
            <thead>
              <tr>
                <td className="w-36 sm:w-44" />
                {vehicles.map((v) => (
                  <th key={v.id} scope="col" className="p-3 text-left align-top font-normal">
                    <Link href={vehicleHref(v)} className="group block">
                      <span className="relative mb-4 block aspect-[4/3] overflow-hidden bg-bg-elevated">
                        {v.images[0] && (
                          <Image
                            src={v.images[0].src}
                            alt={v.images[0].alt}
                            fill
                            sizes="(min-width: 1024px) 26vw, 40vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </span>
                      <span className="eyebrow block text-[0.625rem]">{v.brand}</span>
                      <span className="mt-1 block font-display text-2xl text-fg">{v.model}</span>
                      <span className="block text-xs text-muted">{v.version}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const best = bestIds(vehicles, row);
                if (vehicles.every((v) => !row.value(v))) return null;
                return (
                  <tr key={row.label} className="border-t border-line">
                    <th scope="row" className="p-3 text-left font-normal text-muted">
                      {row.label}
                    </th>
                    {vehicles.map((v) => (
                      <td
                        key={v.id}
                        className={cn("p-3", best.has(v.id) ? "text-accent" : "text-fg")}
                      >
                        {row.value(v) ?? "—"}
                        {best.has(v.id) && <span className="sr-only"> (mejor valor)</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-6 text-xs text-subtle">En platino, el mejor valor de cada fila.</p>
        </div>
      )}
    </section>
  );
}
