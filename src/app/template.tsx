"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

let lastPathname: string | null = null;

/**
 * Cortinilla breve (≤ 500 ms) al cambiar de página. No se muestra en la primera carga (para
 * no retrasar el LCP) ni cuando solo cambian los filtros del inventario: `/vehiculos` y su
 * versión filtrada son rutas internas distintas (src/middleware.ts) y la plantilla se vuelve a
 * montar aunque la URL visible siga en /vehiculos.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Con una transición de vista en curso (tarjeta → ficha) la cortinilla también sobra.
  const showCurtain = useRef(
    lastPathname !== null &&
      lastPathname !== pathname &&
      !(typeof document !== "undefined" && "viewTransition" in document.documentElement.dataset),
  ).current;
  useEffect(() => {
    lastPathname = pathname;
  }, [pathname]);
  return (
    <>
      {showCurtain && (
        <div
          aria-hidden
          data-page-curtain
          className="pointer-events-none fixed inset-0 z-[80] origin-top bg-bg-secondary motion-safe:animate-[curtain-up_500ms_var(--ease-luxe)_forwards] motion-reduce:hidden"
        />
      )}
      {children}
    </>
  );
}
