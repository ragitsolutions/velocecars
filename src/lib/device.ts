/**
 * Decide cómo se presenta el coche del hero:
 *  - "video":  giro en bucle (vídeo renderizado desde la escena 3D).
 *  - "static": solo el póster (movimiento reducido, ahorro de datos o red muy lenta).
 * `?hero=static|video` lo fuerza (pruebas).
 */
export type HeroMode = "video" | "static";

type NavigatorExtras = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectHeroMode(): HeroMode {
  const forced = new URLSearchParams(window.location.search).get("hero");
  if (forced === "video" || forced === "static") return forced;
  if (prefersReducedMotion()) return "static";
  const nav = navigator as NavigatorExtras;
  const constrained =
    nav.connection?.saveData === true ||
    ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? "");
  return constrained ? "static" : "video";
}
