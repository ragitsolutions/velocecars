"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "lenis/dist/lenis.css";
import { SCROLL_TO_EVENT } from "@/lib/scroll";

let lenis: Lenis | null = null;

/**
 * Scroll suave (Lenis, con su propio bucle de animación). Se desactiva con
 * prefers-reduced-motion y no afecta al scroll táctil nativo.
 * Los contenedores con scroll propio (menús, modales) llevan `data-lenis-prevent`.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 }, autoRaf: true });
    // Desplazamientos pedidos desde otros componentes (src/lib/scroll.ts).
    const root = document.documentElement;
    root.dataset.smoothScroll = "";
    const onScrollTo = (e: Event) =>
      lenis?.scrollTo((e as CustomEvent<{ top: number }>).detail.top, { duration: 0.9 });
    window.addEventListener(SCROLL_TO_EVENT, onScrollTo);
    return () => {
      window.removeEventListener(SCROLL_TO_EVENT, onScrollTo);
      delete root.dataset.smoothScroll;
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // Cada página nueva empieza arriba (sin animar).
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
