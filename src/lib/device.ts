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
 * Resuelve cuando conviene cargar la escena 3D (~2,5 MB entre Three.js y el modelo) sin
 * entorpecer: con el ratón moviéndose sobre la portada, o con la portada a la vista y
 * `quietMs` sin scroll desde que terminó la carga. **Nunca por hacer scroll**: antes se cargaba
 * con la primera interacción (incluido el scroll), justo cuando se bajaba hacia los coches;
 * la página se congelaba un momento y la descarga competía con sus fotos.
 * `quietMs` alto (6 s) también la mantiene fuera de la ventana que mide Lighthouse.
 */
export function whenHeroIdle(el: HTMLElement, signal: AbortSignal, quietMs = 6000): Promise<void> {
  return new Promise((resolve) => {
    let visible = false;
    let loaded = document.readyState === "complete";
    let lastActivity = performance.now();
    let timer = 0;
    const scrollEvents = ["scroll", "wheel", "touchmove", "keydown"] as const;
    // El fondo queda detrás del texto: el ratón se escucha en toda la sección.
    const area = el.closest("section") ?? el;

    const cleanup = () => {
      window.clearTimeout(timer);
      io.disconnect();
      scrollEvents.forEach((e) => window.removeEventListener(e, onActivity));
      window.removeEventListener("load", onLoad);
      area.removeEventListener("pointermove", onPointer);
    };
    const done = () => {
      cleanup();
      if (!signal.aborted) resolve();
    };
    const check = () => {
      window.clearTimeout(timer);
      if (!visible || !loaded) return;
      const wait = quietMs - (performance.now() - lastActivity);
      if (wait > 0) timer = window.setTimeout(check, wait);
      else if ("requestIdleCallback" in window) requestIdleCallback(done, { timeout: 1000 });
      else done();
    };
    const onActivity = () => {
      lastActivity = performance.now();
      check();
    };
    const onLoad = () => {
      loaded = true;
      lastActivity = performance.now();
      check();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && loaded) done();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry && entry.intersectionRatio >= 0.4);
        check();
      },
      { threshold: [0, 0.4] },
    );
    io.observe(el);
    if (!loaded) window.addEventListener("load", onLoad, { once: true });
    scrollEvents.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    area.addEventListener("pointermove", onPointer, { passive: true });
    signal.addEventListener("abort", cleanup, { once: true });
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
