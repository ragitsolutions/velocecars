import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/ui/link";
import { brandIntros, defaultBrandIntro } from "@/content/brands";
import { getBrands, getInventoryStats } from "@/lib/inventory";
import { parseInventoryParams } from "@/lib/inventory/search-params";
import { JsonLd } from "@/lib/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/vehicle-schema";
import { fitHeading } from "@/lib/utils/fit-heading";
import { formatNumber } from "@/lib/utils/format";
import { InventoryView } from "./inventory-view";

/**
 * Páginas de inventario (general y por marca), compartidas por dos rutas:
 *  - `/vehiculos` y `/vehiculos/[marca]`: estáticas (ISR), sin filtros. Es la entrada desde
 *    menús y buscadores; se sirven cacheadas y comprimidas de una vez.
 *  - `/inventario-filtrado/…`: dinámicas, para URLs con filtros, orden o página. El middleware
 *    (src/middleware.ts) reescribe a ellas sin cambiar la URL visible.
 * Antes eran siempre dinámicas (leían los filtros de la URL): HTML en streaming, peor
 * comprimido (48 KB frente a 24 KB) y sin caché.
 */

export type InventorySearchParams = Record<string, string | string[] | undefined>;

export async function inventoryMetadata(sp: InventorySearchParams = {}): Promise<Metadata> {
  const query = parseInventoryParams(sp);
  const brands = await getBrands();
  const single =
    query.brands?.length === 1 ? brands.find((b) => b.slug === query.brands![0]) : undefined;
  return {
    title: single
      ? `${single.name} de ocasión en Madrid`
      : "Vehículos de ocasión premium y de lujo en Madrid",
    description:
      "Inventario de Veloce Cars: Porsche, Ferrari, Lamborghini, Mercedes-AMG, BMW M, Audi RS y más. Coches revisados, con garantía y atención con cita previa en Pozuelo de Alarcón.",
    // Las combinaciones de filtros apuntan a la página canónica (marca o inventario general).
    alternates: { canonical: single ? `/vehiculos/${single.slug}` : "/vehiculos" },
  };
}

export async function GeneralInventoryPage({ sp = {} }: { sp?: InventorySearchParams }) {
  const query = parseInventoryParams(sp);
  const view = sp.vista === "lista" ? "list" : "grid";
  const stats = await getInventoryStats();

  return (
    <section className="container-luxe pt-[calc(var(--header-h)+3rem)] pb-[var(--section-y)]">
      <header className="@container mb-12 max-w-3xl">
        <p className="eyebrow mb-4">Inventario · {formatNumber(stats.count)} vehículos</p>
        <h1 className="fit [--size:var(--text-5xl)]" style={fitHeading("Vehículos en venta")}>
          Vehículos en venta
        </h1>
        <p className="mt-5 text-lg text-muted">
          Busca tu coche en nuestro stock de alta gama: cada vehículo, revisado, documentado y con
          garantía.
        </p>
      </header>
      <InventoryView query={query} view={view} />
    </section>
  );
}

export async function brandMetadata(slug: string): Promise<Metadata> {
  const brand = (await getBrands()).find((b) => b.slug === slug);
  if (!brand) return {};
  return {
    title: `${brand.name} de ocasión en Madrid · ${brand.count} en stock`,
    description: `${brand.name} seleccionados y revisados en Veloce Cars (Pozuelo de Alarcón): ${brand.models.join(", ")}. Garantía y cita previa.`,
    alternates: { canonical: `/vehiculos/${brand.slug}` },
  };
}

/** Landing por marca (SEO), con texto introductorio editable en src/content/brands.ts. */
export async function BrandInventoryPage({
  slug,
  sp = {},
}: {
  slug: string;
  sp?: InventorySearchParams;
}) {
  const brand = (await getBrands()).find((b) => b.slug === slug);
  if (!brand) notFound();
  const query = { ...parseInventoryParams(sp), brands: [brand.slug] };

  return (
    <section className="container-luxe pt-[calc(var(--header-h)+3rem)] pb-[var(--section-y)]">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", href: "/" },
          { name: "Vehículos", href: "/vehiculos" },
          { name: brand.name, href: `/vehiculos/${brand.slug}` },
        ])}
      />
      <nav aria-label="Migas de pan" className="mb-6 text-xs text-muted">
        <Link href="/vehiculos" className="hover:text-fg">
          Vehículos
        </Link>{" "}
        / <span className="text-fg">{brand.name}</span>
      </nav>
      <header className="@container mb-12 max-w-3xl">
        <p className="eyebrow mb-4">
          {brand.count} {brand.count === 1 ? "vehículo" : "vehículos"} en stock
        </p>
        <h1 className="fit [--size:var(--text-5xl)]" style={fitHeading(`${brand.name} de ocasión`)}>
          {brand.name} de ocasión
        </h1>
        <p className="mt-5 text-lg text-muted">
          {brandIntros[brand.slug] ?? defaultBrandIntro(brand.name)}
        </p>
        <p className="mt-4 text-sm text-subtle">{brand.models.join(" · ")}</p>
      </header>
      <InventoryView
        query={query}
        view={sp.vista === "lista" ? "list" : "grid"}
        basePath={`/vehiculos/${brand.slug}`}
      />
    </section>
  );
}
