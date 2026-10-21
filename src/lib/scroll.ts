/** Evento con el que se pide un desplazamiento a Lenis cuando el scroll suave está activo. */
export const SCROLL_TO_EVENT = "vc:scroll-to";

/**
 * Desplaza la ventana hasta `top` (px). Con el scroll suave activo (Lenis marca
 * `html[data-smooth-scroll]`) se lo pide a Lenis: un `window.scrollTo` directo se pelearía con
 * su animación. Sin él, scroll nativo, suave salvo con `prefers-reduced-motion`.
 */
export function scrollWindowTo(top: number) {
  if ("smoothScroll" in document.documentElement.dataset) {
    window.dispatchEvent(new CustomEvent(SCROLL_TO_EVENT, { detail: { top } }));
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}
