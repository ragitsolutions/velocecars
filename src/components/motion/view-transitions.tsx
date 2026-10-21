"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Transición compartida tarjeta → ficha con la View Transitions API. Intercepta los clics en
 * enlaces con `data-view-transition="<nombre>"`: asigna ese nombre a la foto de la tarjeta
 * (`[data-vt-image]`) y la galería de la ficha lo lleva fijo, así el navegador anima una
 * hacia la otra. Sin soporte o con movimiento reducido, la navegación es la normal.
 */
export function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const resolveRef = useRef<(() => void) | null>(null);

  // La nueva página ya está en el DOM cuando cambia la ruta: termina la captura.
  useEffect(() => {
    resolveRef.current?.();
    resolveRef.current = null;
  }, [pathname]);

  useEffect(() => {
    if (!("startViewTransition" in document)) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[data-view-transition]",
      );
      if (!link || (link.target && link.target !== "_self")) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;

      e.preventDefault();
      const image = link.closest("article")?.querySelector<HTMLElement>("[data-vt-image]");
      if (image) image.style.viewTransitionName = link.dataset.viewTransition ?? "";
      const root = document.documentElement;
      root.dataset.viewTransition = "";

      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolveRef.current = resolve;
            router.push(url.pathname + url.search + url.hash);
            // Red lenta: no congelar la pantalla más de lo razonable.
            setTimeout(resolve, 2500);
          }),
      );
      transition.finished.finally(() => {
        delete root.dataset.viewTransition;
        if (image) image.style.viewTransitionName = "";
      });
    };
    // Fase de captura: antes de que el <Link> de Next gestione el clic.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
