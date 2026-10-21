"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "lenis/dist/lenis.css";

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
    return () => {
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
