import type { Metadata } from "next";
import { SearchForm } from "@/components/inventory/search-form";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { ButtonLink } from "@/components/ui/button";
import { getBrands, getFeaturedVehicles } from "@/lib/inventory";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

/** 404 con buscador de inventario, accesos por marca y coches destacados. */
export default async function NotFound() {
  const [featured, brands] = await Promise.all([getFeaturedVehicles(3), getBrands()]);
  return (
    <section className="container-luxe pt-[calc(var(--header-h)+5rem)] pb-[var(--section-y)]">
      <p className="eyebrow mb-6">Error 404</p>
      <h1 className="max-w-3xl text-5xl">Esta página ya no está en nuestra exposición.</h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Puede que el vehículo se haya vendido o que la dirección haya cambiado. Busca en el stock o
        echa un vistazo a nuestros destacados.
      </p>
      <SearchForm id="not-found-q" placeholder="Marca, modelo, año…" className="mt-10" />
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Marcas en stock">
        {brands.slice(0, 10).map((b) => (
          <li key={b.slug}>
            <a
              href={`/vehiculos/${b.slug}`}
              className="inline-block border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-fg"
            >
              {b.name}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-4">
        <ButtonLink href="/vehiculos">Ver inventario</ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Ir al inicio
        </ButtonLink>
      </div>
      <h2 className="mt-20 mb-8 text-2xl">Destacados</h2>
      <ul className="grid gap-6 md:grid-cols-3">
        {featured.map((v) => (
          <li key={v.id}>
            <VehicleCard vehicle={v} />
          </li>
        ))}
      </ul>
    </section>
  );
}
