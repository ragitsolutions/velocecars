import Link from "@/components/ui/link";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BrandSummary, Vehicle } from "@/lib/inventory/types";

/**
 * «En venta»: el núcleo de la home, como en la web actual. Rejilla con los coches destacados
 * (orden «Por defecto» que el cliente gestiona en DealCar) y accesos por marca.
 */
export function StockSection({
  vehicles,
  brands,
  total,
}: {
  vehicles: Vehicle[];
  brands: BrandSummary[];
  total: number;
}) {
  return (
    <section aria-labelledby="stock-title" className="section pt-16 md:pt-20">
      <div className="container-luxe">
        <div className="mb-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal className="md:min-w-0 md:flex-1">
            <SectionHeading
              index="01"
              eyebrow="En venta"
              title={<span id="stock-title">Nuestro stock</span>}
              intro="En Veloce Cars contamos con un stock exclusivo de coches de alta gama, seleccionados cuidadosamente."
            />
          </Reveal>
          <Reveal delay={0.1} className="shrink-0">
            <ButtonLink href="/vehiculos">Ver los {total} vehículos</ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <nav aria-label="Stock por marca" className="mb-10 flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/vehiculos/${b.slug}`}
                className="inline-flex items-center gap-2 border border-line px-3 py-2 text-xs text-muted transition-colors hover:border-accent hover:text-fg"
              >
                {b.name}
                <span className="tabular text-subtle">{b.count}</span>
              </Link>
            ))}
          </nav>
        </Reveal>

        <RevealGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => (
            <RevealItem key={v.id}>
              <VehicleCard vehicle={v} />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-14 flex justify-center">
          <ButtonLink href="/vehiculos" size="lg" variant="solid">
            Ver todo el inventario
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
