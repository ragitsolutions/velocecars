"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { FilterPanel } from "./filter-panel";
import { persistedUi } from "./persisted-ui";

const QUERY = "(min-width: 1024px)";
const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

/**
 * Panel lateral de filtros, solo en escritorio. No se renderiza en el servidor: en móvil está
 * oculto (allí los filtros van en un panel desplegable) y sus ~200 nodos solo añadían trabajo
 * antes del primer pintado. En escritorio aparece al hidratar, con una entrada suave.
 */
export function DesktopFilters() {
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const ref = useRef<HTMLDivElement>(null);
  // La entrada suave solo la primera vez; al volver a montarse (al filtrar) conserva el scroll.
  const [animate] = useState(!persistedUi.sidebarShown);
  useLayoutEffect(() => {
    const scroller = ref.current?.parentElement;
    if (!desktop || !scroller) return;
    persistedUi.sidebarShown = true;
    scroller.scrollTop = persistedUi.sidebarScroll;
    const onScroll = () => (persistedUi.sidebarScroll = scroller.scrollTop);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [desktop]);

  if (!desktop) return <div aria-hidden className="min-h-[60vh]" />;
  return (
    <div
      ref={ref}
      className={animate ? "motion-safe:animate-[fade-in_400ms_var(--ease-luxe)]" : undefined}
    >
      <FilterPanel />
    </div>
  );
}
