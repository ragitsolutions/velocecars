import Image from "next/image";
import Link from "@/components/ui/link";
import type { Vehicle } from "@/lib/inventory/types";
import { vehicleHref, vehicleTransitionName } from "@/lib/inventory/urls";
import { fitHeading } from "@/lib/utils/fit-heading";
import { cn, formatKm, formatPower, formatPrice } from "@/lib/utils/format";
import { VehicleCardActions } from "./vehicle-card-actions";

export { vehicleHref, vehicleTransitionName };

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <span
      className={cn(
        "border px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.18em] uppercase backdrop-blur-md",
        tone === "accent"
          ? "border-accent/50 bg-bg/70 text-accent"
          : "border-line-strong bg-bg/70 text-fg",
      )}
    >
      {children}
    </span>
  );
}

/**
 * Tarjeta de inventario. Fotos con recorte uniforme 4:3 (las del cliente varían ligeramente
 * de proporción) y degradado inferior para dar consistencia a fondos distintos.
 * `layout="list"`: foto a la izquierda y datos a la derecha (vista de lista del inventario).
 */
export function VehicleCard({
  vehicle: v,
  priority,
  sizes = "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw",
  layout = "grid",
  actions = true,
}: {
  vehicle: Vehicle;
  priority?: boolean;
  sizes?: string;
  layout?: "grid" | "list";
  actions?: boolean;
}) {
  const list = layout === "list";
  const cover = v.images[0];
  const sold = v.status === "vendido";
  const quickSpecs = (
    [
      ["0-100", v.acceleration0100 ? `${String(v.acceleration0100).replace(".", ",")} s` : null],
      ["Punta", v.topSpeedKmh ? `${v.topSpeedKmh} km/h` : null],
      ["Cambio", v.transmission],
      ["Carrocería", v.bodyType],
    ] as [string, string | null][]
  )
    .filter((s): s is [string, string] => Boolean(s[1]))
    .slice(0, 3);
  return (
    <article
      data-cursor="ver"
      className={cn(
        "group relative flex h-full border border-line bg-bg-secondary transition-[border-color,box-shadow,transform] duration-500 ease-luxe",
        list ? "flex-col sm:flex-row" : "flex-col",
        "focus-within:border-accent/60",
        "hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--glow-accent)]",
        sold && "opacity-60",
      )}
    >
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden bg-bg-elevated",
          list && "sm:w-2/5 sm:shrink-0",
        )}
        data-vt-image
      >
        {cover && (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={sizes}
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
            className="object-cover transition-transform duration-[1200ms] ease-luxe group-hover:scale-[1.04]"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent"
        />
        {/* Prestaciones al pasar el ratón (en táctil se ven en la ficha) */}
        {quickSpecs.length > 0 && (
          <dl
            aria-hidden
            className="tabular absolute inset-x-0 bottom-0 flex translate-y-3 justify-between gap-4 border-t border-line-strong bg-bg/75 px-5 py-3 text-[0.6875rem] opacity-0 backdrop-blur-md transition-all duration-500 ease-luxe group-hover:translate-y-0 group-hover:opacity-100"
          >
            {quickSpecs.map(([label, value]) => (
              <div key={label}>
                <dt className="tracking-[0.16em] text-subtle uppercase">{label}</dt>
                <dd className="mt-0.5 text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {v.status === "reservado" && <Badge>Reservado</Badge>}
          {sold && <Badge>Vendido</Badge>}
          {v.isNew && !sold && <Badge tone="accent">Recién llegado</Badge>}
          {v.priceOld && v.priceOld > v.price && <Badge tone="accent">Precio rebajado</Badge>}
        </div>
      </div>
      {/* Fuera del contenedor de la foto: su view-transition-name crea un contexto de
          apilamiento y el enlace que cubre la tarjeta taparía los botones. */}
      {actions && <VehicleCardActions id={v.id} name={`${v.brand} ${v.model}`} />}

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="@container">
          <p className="eyebrow mb-2 text-[0.625rem]">{v.brand}</p>
          <h3 className="fit leading-tight [--size:var(--text-3xl)]" style={fitHeading(v.model)}>
            <Link
              href={vehicleHref(v)}
              data-view-transition={vehicleTransitionName(v.id)}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {v.model}
              <span className="sr-only"> {v.version}</span>
            </Link>
          </h3>
          <p aria-hidden className="mt-1 line-clamp-2 text-sm text-muted">
            {v.version}
          </p>
          {list && v.highlights.length > 0 && (
            <ul className="mt-4 hidden flex-wrap gap-2 sm:flex">
              {v.highlights.slice(0, 3).map((h) => (
                <li key={h} className="border border-line px-2 py-1 text-[0.6875rem] text-muted">
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>

        <dl className="tabular mt-auto grid grid-cols-4 gap-2 border-t border-line pt-4 text-xs text-muted">
          <div>
            <dt className="sr-only">Año</dt>
            <dd>{v.year}</dd>
          </div>
          <div>
            <dt className="sr-only">Kilómetros</dt>
            <dd>{formatKm(v.mileageKm)}</dd>
          </div>
          <div>
            <dt className="sr-only">Potencia</dt>
            <dd>{v.powerCv ? formatPower(v.powerCv) : "—"}</dd>
          </div>
          <div>
            <dt className="sr-only">Combustible</dt>
            <dd className="truncate">{v.fuel}</dd>
          </div>
        </dl>

        <div className="flex items-end justify-between gap-4">
          <p className="tabular font-display text-3xl leading-none text-fg">
            {v.priceOld && v.priceOld > v.price && (
              <s className="mr-2 font-sans text-sm text-subtle">{formatPrice(v.priceOld)}</s>
            )}
            {formatPrice(v.price)}
          </p>
          {v.priceNote && <p className="text-[0.6875rem] text-subtle">{v.priceNote}</p>}
        </div>
      </div>
    </article>
  );
}
