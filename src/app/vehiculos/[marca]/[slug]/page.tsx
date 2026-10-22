import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Cog,
  FileCheck2,
  Fuel,
  Gauge,
  MessageCircle,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { LazyContactForm, LazyFinancingCalculator } from "@/components/forms/lazy";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { VehicleCardActions } from "@/components/inventory/vehicle-card-actions";
import { ButtonLink } from "@/components/ui/button";
import { WithPending } from "@/components/ui/pending";
import { EmissionBadge } from "@/components/vehicle/emission-badge";
import { SharePrint } from "@/components/vehicle/share-print";
import { VehicleGallery } from "@/components/vehicle/vehicle-gallery";
import { estimateFor } from "@/lib/financing";
import { getAllVehicles, getSimilarVehicles, getVehicle } from "@/lib/inventory";
import { groupEquipment } from "@/lib/inventory/equipment";
import type { Vehicle } from "@/lib/inventory/types";
import { vehicleHref, vehicleTransitionName } from "@/lib/inventory/urls";
import { JsonLd } from "@/lib/seo/json-ld";
import { fitHeading } from "@/lib/utils/fit-heading";
import { breadcrumbSchema, vehicleSchema } from "@/lib/seo/vehicle-schema";
import { PENDING, site, whatsappUrl } from "@/lib/site";
import { formatKm, formatNumber, formatPower, formatPrice } from "@/lib/utils/format";

export const revalidate = 3600;

type Params = { marca: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return (await getAllVehicles()).map((v) => ({ marca: v.brandSlug, slug: v.slug }));
}

const fullName = (v: Vehicle) => `${v.brand} ${v.model} ${v.version}`.trim();

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { marca, slug } = await params;
  const v = await getVehicle(marca, slug);
  if (!v) return {};
  // «Ferrari 458 Italia 2010 · 76.000 km · 174.500 €»
  const title = `${fullName(v)} ${v.year} · ${formatKm(v.mileageKm)} · ${formatPrice(v.price)}`;
  const description = `${fullName(v)} de ${v.year} con ${formatKm(v.mileageKm)}, ${v.fuel.toLowerCase()}, ${v.transmission.toLowerCase()}${v.powerCv ? `, ${formatPower(v.powerCv)}` : ""}. ${v.highlights.slice(0, 2).join(". ")}. Disponible en Veloce Cars, Pozuelo de Alarcón.`;
  const image = v.images[0];
  return {
    title,
    description,
    alternates: { canonical: vehicleHref(v) },
    openGraph: {
      type: "website",
      title,
      description,
      url: vehicleHref(v),
      images: image
        ? [{ url: image.src, width: image.w, height: image.h, alt: image.alt }]
        : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: v.status === "vendido" ? { index: false, follow: true } : undefined,
  };
}

const decimal = (n: number) => String(n).replace(".", ",");

type SpecGroup = { title: string; rows: [string, string | undefined][] };

function techGroups(v: Vehicle): SpecGroup[] {
  const groups: SpecGroup[] = [
    {
      title: "Motor y prestaciones",
      rows: [
        ["Motor", v.engine],
        [
          "Potencia",
          v.powerCv
            ? `${formatPower(v.powerCv)}${v.powerKw ? ` (${v.powerKw} kW)` : ""}`
            : undefined,
        ],
        ["Combustible", v.fuel],
        ["Cambio", v.transmission],
        ["Tracción", v.drivetrain],
        ["Velocidad máxima", v.topSpeedKmh ? `${formatNumber(v.topSpeedKmh)} km/h` : undefined],
        ["0-100 km/h", v.acceleration0100 ? `${decimal(v.acceleration0100)} s` : undefined],
      ],
    },
    {
      title: "Datos del vehículo",
      rows: [
        ["Estado", v.condition],
        [
          "Matriculación",
          v.month ? `${String(v.month).padStart(2, "0")}/${v.year}` : String(v.year),
        ],
        ["Kilómetros", formatKm(v.mileageKm)],
        ["Carrocería", v.bodyType],
        ["Color exterior", v.color],
        ["Color interior", v.interiorColor],
        ["Puertas / plazas", v.doors && v.seats ? `${v.doors} / ${v.seats}` : undefined],
        ["Propietarios", v.owners ? String(v.owners) : undefined],
      ],
    },
    {
      title: "Consumo y medidas",
      rows: [
        ["Consumo mixto", v.consumption],
        ["Emisiones CO₂", v.emissions],
        ["Etiqueta DGT", v.emissionLabel],
        ["Peso", v.weightKg ? `${formatNumber(v.weightKg)} kg` : undefined],
        [
          "Largo × ancho × alto",
          v.dimensionsMm
            ? `${formatNumber(v.dimensionsMm.length)} × ${formatNumber(v.dimensionsMm.width)} × ${formatNumber(v.dimensionsMm.height)} mm`
            : undefined,
        ],
      ],
    },
  ];
  return groups
    .map((g) => ({ ...g, rows: g.rows.filter(([, value]) => value) }))
    .filter((g) => g.rows.length > 0);
}

export default async function VehiclePage({ params }: { params: Promise<Params> }) {
  const { marca, slug } = await params;
  const v = await getVehicle(marca, slug);
  if (!v) notFound();

  const name = fullName(v);
  const similar = await getSimilarVehicles(v, 4);
  const estimate = estimateFor(v.price);
  const equipment = groupEquipment(v.equipment);
  const groups = techGroups(v);
  const sold = v.status === "vendido";
  const reserved = v.status === "reservado";
  const waMessage = `Hola Veloce Cars, me interesa el ${name} (${v.year}, ${formatKm(v.mileageKm)}). ¿Sigue disponible?`;
  const appointmentHref = `/contacto?vehiculo=${v.id}#cita`;
  const crumbs = [
    { name: "Inicio", href: "/" },
    { name: "Vehículos", href: "/vehiculos" },
    { name: v.brand, href: `/vehiculos/${v.brandSlug}` },
    { name: `${v.model} ${v.version}`.trim(), href: vehicleHref(v) },
  ];

  const summary = [
    { icon: CalendarDays, label: "Año", value: String(v.year) },
    { icon: Gauge, label: "Kilómetros", value: formatKm(v.mileageKm) },
    { icon: Zap, label: "Potencia", value: v.powerCv ? formatPower(v.powerCv) : "—" },
    { icon: Fuel, label: "Combustible", value: v.fuel },
    { icon: Cog, label: "Cambio", value: v.transmission },
  ];

  return (
    <article className="vehicle-sheet pt-[var(--header-h)] pb-24 lg:pb-0">
      <JsonLd data={vehicleSchema(v)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <nav aria-label="Migas de pan" className="container-luxe py-6 print:hidden">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3 text-subtle" aria-hidden />}
              {i < crumbs.length - 1 ? (
                <Link href={c.href} className="hover:text-fg">
                  {c.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-fg">
                  {c.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {(sold || reserved) && (
        <div className="container-luxe mb-6">
          <p role="status" className="border border-accent/50 bg-accent-soft px-5 py-4 text-sm">
            {sold
              ? "Este vehículo ya se ha vendido. Te enseñamos otros parecidos más abajo o te avisamos si entra uno similar."
              : "Este vehículo está reservado. Si la reserva no se formaliza, te avisamos: déjanos tus datos."}
          </p>
        </div>
      )}

      <div className="container-luxe">
        <VehicleGallery
          images={v.images}
          title={name}
          transitionName={vehicleTransitionName(v.id)}
        />
      </div>

      <div className="container-luxe grid gap-12 py-12 lg:grid-cols-12 lg:gap-16">
        {/* Columna principal */}
        <div className="flex min-w-0 flex-col gap-16 lg:col-span-8">
          <header className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-6">
              <div className="@container min-w-0 flex-1">
                <p className="eyebrow mb-3">{v.brand}</p>
                <h1
                  className="fit [--size:var(--text-4xl)] sm:[--size:var(--text-5xl)]"
                  style={fitHeading(v.model)}
                >
                  {v.model}
                </h1>
                {v.version && <p className="mt-3 text-lg text-muted">{v.version}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-4">
                {v.emissionLabel && <EmissionBadge label={v.emissionLabel} className="mt-1" />}
                <VehicleCardActions
                  id={v.id}
                  name={name}
                  className="relative lg:hidden print:hidden"
                />
              </div>
            </div>
            <ul className="tabular grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-5">
              {summary.map(({ icon: Icon, label, value }) => (
                <li
                  key={label}
                  className="flex flex-col gap-2 bg-bg p-4 last:col-span-2 sm:last:col-span-1"
                >
                  <Icon className="size-5 text-accent" strokeWidth={1.25} aria-hidden />
                  <span className="text-[0.6875rem] tracking-[0.18em] text-subtle uppercase">
                    {label}
                  </span>
                  <span className="text-sm">{value}</span>
                </li>
              ))}
            </ul>
            {v.highlights.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {v.highlights.map((h) => (
                  <li
                    key={h}
                    className="border border-accent/40 px-3 py-1.5 text-xs tracking-wide text-accent"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {v.description && (
            <section aria-labelledby="descripcion">
              <h2 id="descripcion" className="mb-6 text-2xl sm:text-3xl">
                Descripción
              </h2>
              <div className="max-w-prose space-y-4 text-muted">
                {v.description.split(/\n{2,}/).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="ficha-tecnica">
            <h2 id="ficha-tecnica" className="mb-6 text-2xl sm:text-3xl">
              Ficha técnica
            </h2>
            <div className="grid gap-10 md:grid-cols-2 md:gap-x-12">
              {groups.map((g) => (
                <div key={g.title} className="break-inside-avoid">
                  <h3 className="mb-3 font-sans text-xs font-semibold tracking-[0.18em] text-subtle normal-case">
                    {g.title.toUpperCase()}
                  </h3>
                  <dl className="tabular border-t border-line">
                    {g.rows.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-6 border-b border-line py-3 text-sm"
                      >
                        <dt className="text-muted">{label}</dt>
                        <dd className="text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>

          {equipment.length > 0 && (
            <section aria-labelledby="equipamiento">
              <h2 id="equipamiento" className="mb-6 text-2xl sm:text-3xl">
                Equipamiento
              </h2>
              <div className="border-t border-line">
                {equipment.map((g, i) => (
                  <details key={g.name} open={i === 0} className="group border-b border-line">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                      <span className="text-base">
                        {g.name}
                        <span className="tabular ml-3 text-xs text-subtle">{g.items.length}</span>
                      </span>
                      <ChevronDown
                        className="size-4 text-muted transition-transform duration-300 group-open:rotate-180 print:hidden"
                        aria-hidden
                      />
                    </summary>
                    <ul className="grid gap-x-10 gap-y-3 pb-6 text-sm text-muted sm:grid-cols-2">
                      {g.items.map((e) => (
                        <li key={e} className="flex gap-3">
                          <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-accent" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="garantia">
            <h2 id="garantia" className="mb-6 text-2xl sm:text-3xl">
              Garantía y servicios incluidos
            </h2>
            <ul className="grid gap-px border border-line bg-line sm:grid-cols-3">
              <li className="flex flex-col gap-3 bg-bg p-6">
                <ShieldCheck className="size-6 text-accent" strokeWidth={1.25} aria-hidden />
                <p className="text-base">
                  {v.warrantyMonths ? `Garantía de ${v.warrantyMonths} meses` : "Garantía"}
                </p>
                <p className="text-sm text-muted">
                  {v.warrantyOfficial
                    ? "Garantía oficial de la marca aún vigente."
                    : "Cobertura de garantía en la compra del vehículo."}
                </p>
              </li>
              <li className="flex flex-col gap-3 bg-bg p-6">
                <FileCheck2 className="size-6 text-accent" strokeWidth={1.25} aria-hidden />
                <p className="text-base">Trámites incluidos</p>
                <p className="text-sm text-muted">
                  Contrato, transferencia y cambio de titularidad: nos ocupamos de todo el papeleo.
                </p>
              </li>
              <li className="flex flex-col gap-3 bg-bg p-6">
                <Gauge className="size-6 text-accent" strokeWidth={1.25} aria-hidden />
                <p className="text-base">Revisado y documentado</p>
                <p className="text-sm text-muted">
                  Revisado antes de publicarse y entregado con su historial y documentación en
                  regla.
                </p>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-subtle">
              Como consumidor dispones, además, de la garantía legal de conformidad prevista en el
              Real Decreto Legislativo 1/2007 (TRLGDCU) para bienes de segunda mano adquiridos a un
              profesional.{" "}
              <WithPending text={PENDING("revisión legal del texto de garantía y su duración")} />
            </p>
          </section>

          {!sold && (
            <section aria-labelledby="financiacion" className="print:hidden">
              <h2 id="financiacion" className="mb-2 text-2xl sm:text-3xl">
                Calcula tu cuota
              </h2>
              <p className="mb-6 text-muted">
                Ajusta la entrada y el plazo para ver una cuota orientativa.
              </p>
              <LazyFinancingCalculator price={v.price} />
            </section>
          )}

          <section
            aria-labelledby="informacion-title"
            id="informacion"
            className="scroll-mt-28 print:hidden"
          >
            <h2 id="informacion-title" className="mb-2 text-2xl sm:text-3xl">
              {sold ? "Busco uno parecido" : "Solicitar información"}
            </h2>
            <p className="mb-8 text-muted">
              Escríbenos y te contestamos con disponibilidad, fotos adicionales o para concertar una
              visita.
            </p>
            <LazyContactForm vehicle={{ id: v.id, name: `${name} (${v.year})` }} />
          </section>
        </div>

        {/* Lateral fijo (escritorio) */}
        <aside className="hidden lg:col-span-4 lg:block print:block">
          <div className="sticky top-[calc(var(--header-h-compact)+1.5rem)] flex flex-col gap-6 border border-line bg-bg-secondary p-8">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs tracking-[0.18em] text-subtle uppercase">Precio</p>
                <VehicleCardActions id={v.id} name={name} className="relative print:hidden" />
              </div>
              <div className="@container">
                <p
                  className="tabular fit mt-2 font-display leading-none [--size:var(--text-4xl)] xl:[--size:var(--text-5xl)]"
                  style={fitHeading(formatPrice(v.price))}
                  data-testid="vehicle-price"
                >
                  {formatPrice(v.price)}
                </p>
                {v.priceOld && v.priceOld > v.price && (
                  <p className="tabular mt-2 text-sm text-subtle line-through">
                    {formatPrice(v.priceOld)}
                  </p>
                )}
                {v.priceNote && <p className="mt-2 text-xs text-subtle">{v.priceNote}</p>}
              </div>
            </div>
            {!sold && (
              <a
                href="#financiacion"
                className="group block border-t border-line pt-5 print:hidden"
              >
                <p className="text-xs tracking-[0.18em] text-subtle uppercase">
                  Financiación orientativa
                </p>
                <p className="tabular mt-1 text-lg">
                  desde {formatPrice(Math.round(estimate.monthly))}
                  <span className="text-sm text-muted">/mes</span>
                </p>
                <p className="mt-1 text-xs text-subtle group-hover:text-muted">
                  {estimate.months} meses · entrada {formatPrice(Math.round(estimate.downPayment))}{" "}
                  · ver cálculo
                </p>
              </a>
            )}
            <div className="flex flex-col gap-3 print:hidden">
              <ButtonLink href="#informacion" variant="solid">
                {sold ? "Busco uno parecido" : "Solicitar información"}
              </ButtonLink>
              {!sold && <ButtonLink href={appointmentHref}>Reservar cita</ButtonLink>}
              <div className="grid grid-cols-2 gap-3">
                <ButtonLink
                  href={whatsappUrl(waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="ghost"
                  className="border border-line"
                >
                  <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> WhatsApp
                </ButtonLink>
                <ButtonLink
                  href={`tel:${site.contact.phone.e164}`}
                  size="sm"
                  variant="ghost"
                  className="border border-line"
                >
                  <Phone className="size-4" strokeWidth={1.5} aria-hidden /> Llamar
                </ButtonLink>
              </div>
            </div>
            <SharePrint title={`${name} · ${site.name}`} />
            <p className="hidden text-xs text-subtle print:block">
              {site.name} · {site.address.street}, {site.address.city} ·{" "}
              {site.contact.phone.display} · {site.url}
              {vehicleHref(v)}
            </p>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section
          aria-labelledby="similares"
          className="border-t border-line py-[var(--section-y)] print:hidden"
        >
          <div className="container-luxe">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 id="similares" className="text-2xl sm:text-3xl">
                Vehículos similares
              </h2>
              <Link
                href={`/vehiculos/${v.brandSlug}`}
                className="link-underline text-sm text-muted hover:text-fg"
              >
                Más {v.brand}
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {similar.map((s) => (
                <li key={s.id}>
                  <VehicleCard
                    vehicle={s}
                    sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Barra inferior fija (móvil y tableta) */}
      {/* Con la barra inferior (móvil y tableta) sobra el botón flotante de WhatsApp y el
          comparador se apila encima. Estilo propio de la página: desaparece al salir. */}
      <style>{`@media (max-width: 1023px) {
        [data-testid="whatsapp-button"] { display: none; }
        [data-compare-tray] { bottom: 4.25rem; }
      }`}</style>
      <div
        data-vehicle-bar
        className="fixed inset-x-0 bottom-0 z-[var(--z-floating)] border-t border-line-strong bg-bg-elevated/95 backdrop-blur-xl lg:hidden print:hidden"
      >
        <div className="container-luxe flex items-center gap-3 py-3">
          <div className="@container min-w-0 flex-1">
            <p
              className="tabular fit font-display leading-none [--size:var(--text-xl)]"
              style={fitHeading(formatPrice(v.price))}
            >
              {formatPrice(v.price)}
            </p>
            {!sold && (
              <p className="tabular mt-1 truncate text-xs text-subtle">
                desde {formatPrice(Math.round(estimate.monthly))}/mes
              </p>
            )}
          </div>
          <a
            href={whatsappUrl(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribir por WhatsApp"
            className="grid size-11 shrink-0 place-items-center border border-line text-fg"
          >
            <MessageCircle className="size-5" strokeWidth={1.5} aria-hidden />
          </a>
          <a
            href={`tel:${site.contact.phone.e164}`}
            aria-label={`Llamar al ${site.contact.phone.display}`}
            className="grid size-11 shrink-0 place-items-center border border-line text-fg"
          >
            <Phone className="size-5" strokeWidth={1.5} aria-hidden />
          </a>
          <ButtonLink href="#informacion" variant="solid" size="sm" className="h-11 shrink-0 px-4">
            Me interesa
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
