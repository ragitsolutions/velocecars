import { Suspense } from "react";
import { getInventoryFacets, getVehicles } from "@/lib/inventory";
import { inventoryHref } from "@/lib/inventory/search-params";
import type { InventoryQuery } from "@/lib/inventory/types";
import { ButtonLink } from "@/components/ui/button";
import { ActiveFilters, InventoryToolbar } from "./inventory-toolbar";
import { DesktopFilters } from "./desktop-filters";
import { InventoryProvider, type InventoryView as View } from "./inventory-context";
import { Pagination } from "./pagination";
import { ResultsGrid } from "./results-grid";
import { VehicleCard } from "./vehicle-card";

/**
 * Inventario completo (filtros + resultados + paginación). Lo usan /vehiculos y las
 * landings por marca. Se renderiza en el servidor con los parámetros de la URL.
 */
export async function InventoryView({
  query,
  view,
  basePath = "/vehiculos",
}: {
  query: InventoryQuery;
  view: View;
  /** Ruta de la landing (p. ej. /vehiculos/porsche) para que la paginación no la abandone. */
  basePath?: string;
}) {
  const [result, facets] = await Promise.all([getVehicles(query), getInventoryFacets(query)]);

  const hrefFor = (page: number) => {
    let href = inventoryHref({ ...query, page });
    if (basePath !== "/vehiculos") {
      const { brands: _b, ...rest } = query;
      const qs = inventoryHref({ ...rest, page }).split("?")[1];
      href = `${basePath}${qs ? `?${qs}` : ""}`;
    }
    return view === "list" ? `${href}${href.includes("?") ? "&" : "?"}vista=lista` : href;
  };

  return (
    <InventoryProvider query={query} facets={facets} total={result.total} view={view}>
      <div className="grid gap-10 lg:grid-cols-[18rem_1fr] xl:gap-14">
        <aside aria-label="Filtros" className="hidden lg:block">
          <div
            className="sticky top-[calc(var(--header-h-compact)+1.5rem)] max-h-[calc(100dvh-var(--header-h-compact)-3rem)] overflow-y-auto pr-2"
            data-lenis-prevent
          >
            <DesktopFilters />
          </div>
        </aside>

        <div className="min-w-0">
          <Suspense>
            <InventoryToolbar />
            <ActiveFilters />
          </Suspense>
          <div className="mt-8">
            <h2 className="sr-only">Resultados</h2>
            {result.items.length ? (
              <Suspense>
                <ResultsGrid
                  items={result.items.map((v, i) => ({
                    id: v.id,
                    // Cada tarjeta en su propio límite: se hidratan en tareas cortas.
                    node: (
                      <Suspense>
                        <VehicleCard
                          vehicle={v}
                          layout={view}
                          priority={i === 0}
                          sizes={
                            view === "list"
                              ? "(min-width: 640px) 30vw, 92vw"
                              : "(min-width: 1280px) 26vw, (min-width: 640px) 45vw, 92vw"
                          }
                        />
                      </Suspense>
                    ),
                  }))}
                />
              </Suspense>
            ) : (
              <div className="border border-dashed border-line-strong p-12 text-center">
                <p className="font-display text-2xl">Ningún vehículo coincide</p>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted">
                  Prueba a quitar algún filtro. Y si buscas un coche concreto, cuéntanoslo: muchos
                  llegan antes de publicarse.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <ButtonLink href={basePath}>Ver todo</ButtonLink>
                  <ButtonLink href="/contacto" variant="ghost">
                    Te lo buscamos
                  </ButtonLink>
                </div>
              </div>
            )}
          </div>
          <Pagination page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} />
        </div>
      </div>
    </InventoryProvider>
  );
}
