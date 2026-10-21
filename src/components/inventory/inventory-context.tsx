"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, useTransition } from "react";
import { inventoryHref } from "@/lib/inventory/search-params";
import type { InventoryFacets } from "@/lib/inventory/query";
import type { InventoryQuery } from "@/lib/inventory/types";
import { scrollWindowTo } from "@/lib/scroll";
import { persistedUi } from "./persisted-ui";

export type InventoryView = "grid" | "list";

type Ctx = {
  query: InventoryQuery;
  facets: InventoryFacets;
  total: number;
  view: InventoryView;
  pending: boolean;
  /** Aplica cambios de filtros (vuelve a la página 1) actualizando la URL. */
  apply: (patch: Partial<InventoryQuery>) => void;
  setView: (view: InventoryView) => void;
  clear: () => void;
};

const InventoryContext = createContext<Ctx | null>(null);

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory fuera de <InventoryProvider>");
  return ctx;
}

/**
 * Los filtros viven en la URL (compartible y rastreable). Cada cambio hace un `router.replace`
 * dentro de una transición: el servidor devuelve la nueva página de resultados sin recargar y
 * mientras tanto los resultados se atenúan.
 */
export function InventoryProvider({
  query,
  facets,
  total,
  view,
  children,
}: {
  query: InventoryQuery;
  facets: InventoryFacets;
  total: number;
  view: InventoryView;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  // Estado pedido: casillas, chips y orden cambian al instante y se mantienen hasta que el
  // servidor devuelve esa misma consulta (con useOptimistic se perdían si la transición
  // terminaba antes que la respuesta, p. ej. con la red lenta).
  const serverKey = `${inventoryHref(query)}|${view}`;
  const [requested, setRequested] = useState<{
    query: InventoryQuery;
    view: InventoryView;
    key: string;
    fromKey: string;
  } | null>(null);
  // Se descarta cuando llega la consulta pedida o, por seguridad, cuando la URL cambia por
  // otra vía (atrás/adelante) y no queda ninguna navegación en curso.
  if (requested && (requested.key === serverKey || (requested.fromKey !== serverKey && !pending))) {
    setRequested(null);
  }
  const active = requested && requested.key !== serverKey ? requested : null;

  const navigate = useCallback(
    (next: InventoryQuery, nextView: InventoryView = view) => {
      let href = inventoryHref(next);
      // En la landing de una marca, mientras solo se filtre por esa marca, seguimos en ella.
      const brandLanding = pathname.match(/^\/vehiculos\/([a-z0-9-]+)$/)?.[1];
      if (brandLanding && next.brands?.length === 1 && next.brands[0] === brandLanding) {
        const { brands: _brands, ...rest } = next;
        const qs = inventoryHref(rest).split("?")[1];
        href = `/vehiculos/${brandLanding}${qs ? `?${qs}` : ""}`;
      }
      if (nextView === "list") href += `${href.includes("?") ? "&" : "?"}vista=lista`;
      setRequested({
        query: next,
        view: nextView,
        key: `${inventoryHref(next)}|${nextView}`,
        fromKey: serverKey,
      });
      persistedUi.filtering = true;
      startTransition(() => router.replace(href, { scroll: false }));
    },
    [pathname, router, view, serverKey],
  );

  const current = active?.query ?? query;
  const apply = useCallback(
    (patch: Partial<InventoryQuery>) => navigate({ ...current, ...patch, page: undefined }),
    [navigate, current],
  );
  const setView = useCallback((v: InventoryView) => navigate(current, v), [navigate, current]);
  const clear = useCallback(() => {
    const brandLanding = pathname.match(/^\/vehiculos\/([a-z0-9-]+)$/)?.[1];
    navigate({ sort: current.sort, brands: brandLanding ? [brandLanding] : [] });
  }, [navigate, pathname, current.sort]);

  // Al cambiar de página, subir al inicio de los resultados (no al principio de la página ni
  // quedarse abajo). Fase de captura: antes de que el <Link> de Next gestione el clic.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!(e.target as Element | null)?.closest?.("[data-pagination] a")) return;
      const results = document.getElementById("resultados");
      if (!results) return;
      const header =
        document.querySelector("[data-site-header]")?.getBoundingClientRect().height ?? 0;
      const top = results.getBoundingClientRect().top + window.scrollY - header - 16;
      if (top < window.scrollY) scrollWindowTo(Math.max(0, top));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        query: current,
        facets,
        total,
        view: active?.view ?? view,
        pending: pending || !!active,
        apply,
        setView,
        clear,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}
