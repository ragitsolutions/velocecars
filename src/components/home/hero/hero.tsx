import Link from "@/components/ui/link";
import { SearchForm } from "@/components/inventory/search-form";
import { inventoryHref } from "@/lib/inventory/search-params";
import type { BodyType } from "@/lib/inventory/types";
import { formatNumber } from "@/lib/utils/format";
import { HeroStage } from "./hero-stage";

type Props = { total: number; bodies: { type: BodyType; count: number }[] };

/**
 * Hero de la home, centrado en el inventario como la web actual: titular, buscador y accesos
 * por carrocería sobre el coche 3D. Texto y buscador se renderizan en el servidor (el buscador
 * es un formulario GET a /vehiculos: funciona sin JavaScript) y se pintan antes que la escena.
 */
export function Hero({ total, bodies }: Props) {
  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="relative isolate h-[88svh] min-h-[620px] overflow-hidden"
    >
      <HeroStage />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-3/5 bg-gradient-to-r from-bg/90 via-bg/40 to-transparent md:block"
      />

      <div className="container-luxe pointer-events-none relative flex h-full flex-col justify-end pt-[calc(var(--header-h)+2rem)] pb-10 sm:pb-14">
        <div className="pointer-events-auto max-w-[min(46rem,54vw)] max-md:max-w-none">
          <p className="eyebrow hero-in mb-5" style={{ "--d": "0ms" } as React.CSSProperties}>
            Veloce Cars · Asesoría automovilística
          </p>
          <h1
            id="hero-title"
            className="text-[clamp(1.75rem,0.95rem+3.4vw,4.25rem)] leading-[0.98]"
          >
            {/* Saltos fijos: mismas líneas con cualquier fuente (sin CLS al cargarla) */}
            <span className="hero-in block" style={{ "--d": "80ms" } as React.CSSProperties}>
              Coches de
              <br />
              alta gama,
            </span>
            <span
              className="hero-in block text-accent"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              listos para ti.
            </span>
          </h1>
          <p
            className="hero-in mt-5 max-w-lg text-base text-muted sm:text-lg"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            Vehículos de lujo seleccionados y revisados, con garantía y todos los trámites
            incluidos.
          </p>

          <SearchForm
            id="hero-q"
            placeholder={`Busca entre ${formatNumber(total)} vehículos: marca, modelo, año…`}
            className="hero-in mt-8"
            style={{ "--d": "320ms" } as React.CSSProperties}
          />

          <nav
            aria-label="Buscar por carrocería"
            className="hero-in mt-4 flex flex-wrap gap-2"
            style={{ "--d": "400ms" } as React.CSSProperties}
          >
            {bodies.map((b) => (
              <Link
                key={b.type}
                href={inventoryHref({ bodyTypes: [b.type] })}
                className="inline-flex items-center gap-2 border border-line bg-bg/50 px-3 py-2 text-xs text-fg/80 backdrop-blur-md transition-colors hover:border-accent hover:text-fg"
              >
                {b.type}
                <span className="tabular text-subtle">{b.count}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
