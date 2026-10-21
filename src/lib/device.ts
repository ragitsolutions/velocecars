/**
 * Decide cómo se presenta el coche del hero según el dispositivo (§6.1 del briefing):
 *  - "webgl":    escena 3D en tiempo real.
 *  - "sequence": secuencia de 36 fotogramas 360° controlada por scroll y arrastre.
 *  - "static":   solo el póster (movimiento reducido o sin JavaScript).
 */
export type HeroMode = "webgl" | "sequence" | "static";

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
  getBattery?: () => Promise<{ level: number; charging: boolean }>;
};

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Renderizadores sin GPU real: la escena 3D bloquearía el hilo principal varios segundos. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software|basic render|softpipe/i;

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const ctx =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!ctx) return false;
    // failIfMajorPerformanceCaveat no siempre descarta SwiftShader (p. ej. Chrome headless).
    const info = ctx.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    ctx.getExtension("WEBGL_lose_context")?.loseContext();
    return !SOFTWARE_RENDERER.test(renderer);
  } catch {
    return false;
  }
}

/**
 * Resuelve con la primera interacción del usuario (ratón, toque, rueda, teclado o scroll)
 * o, si no la hay, pasado `timeoutMs`. Sirve para cargar la escena 3D sin competir con la
 * carga inicial (LCP, TBT): mientras tanto se ve el póster, que es el mismo fotograma.
 */
export function afterFirstInteraction(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const events = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"];
    let timer = 0;
    const done = () => {
      events.forEach((e) => window.removeEventListener(e, done));
      window.clearTimeout(timer);
      resolve();
    };
    events.forEach((e) => window.addEventListener(e, done, { once: true, passive: true }));
    timer = window.setTimeout(done, timeoutMs);
  });
}

export async function detectHeroMode(): Promise<HeroMode> {
  if (prefersReducedMotion()) return "static";
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("hero");
  if (forced === "webgl" || forced === "sequence" || forced === "static") return forced;

  const nav = navigator as NavigatorExtras;
  const lowEnd =
    (nav.hardwareConcurrency ?? 8) < 4 ||
    (nav.deviceMemory ?? 8) < 4 ||
    nav.connection?.saveData === true ||
    ["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "");
  if (lowEnd || !supportsWebGL()) return "sequence";

  const isMobile = window.matchMedia("(pointer: coarse)").matches;
  if (isMobile && nav.getBattery) {
    try {
      const battery = await nav.getBattery();
      if (!battery.charging && battery.level < 0.2) return "sequence";
    } catch {
      // API no disponible: se asume batería suficiente.
    }
  }
  return "webgl";
}
