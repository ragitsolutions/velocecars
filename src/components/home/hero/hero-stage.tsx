"use client";

import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { afterFirstInteraction, detectHeroMode, type HeroMode } from "@/lib/device";
import { cn } from "@/lib/utils/format";
import { heroState } from "./hero-progress";
import { TurntableSequence } from "./turntable-sequence";
import { HERO_POSTER } from "./hero-assets";

// Three.js (~600 KB) se carga aparte, solo en el navegador y tras la primera interacción.
const CarScene = dynamic(() => import("@/components/three/car-scene"), { ssr: false });

/** Sin interacción, la escena 3D se carga igualmente pasado este tiempo. */
const LOAD_3D_FALLBACK_MS = 6000;

const PORTRAIT_MEDIA = "(max-aspect-ratio: 1/1)";
const LANDSCAPE_MEDIA = "(min-aspect-ratio: 1/1)";

function Poster({ hidden }: { hidden: boolean }) {
  // Dirección de arte: encuadre horizontal en escritorio y vertical en móvil.
  const common = { alt: "", sizes: "100vw" } as const;
  const { props: desktop } = getImageProps({
    ...common,
    ...HERO_POSTER.landscape,
    placeholder: "blur",
  });
  const { props: mobile } = getImageProps({ ...common, ...HERO_POSTER.portrait });

  // El póster es el elemento LCP: se precarga con prioridad alta, una sola versión por
  // dispositivo (las media queries evitan descargar la que no se va a mostrar).
  preload(desktop.src, {
    as: "image",
    imageSrcSet: desktop.srcSet,
    imageSizes: desktop.sizes,
    fetchPriority: "high",
    media: LANDSCAPE_MEDIA,
  });
  preload(mobile.src, {
    as: "image",
    imageSrcSet: mobile.srcSet,
    imageSizes: mobile.sizes,
    fetchPriority: "high",
    media: PORTRAIT_MEDIA,
  });

  return (
    <picture>
      <source media={PORTRAIT_MEDIA} srcSet={mobile.srcSet} sizes={mobile.sizes} />
      <img
        {...desktop}
        alt=""
        loading="eager"
        fetchPriority="high"
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-luxe",
          hidden && "opacity-0",
        )}
      />
    </picture>
  );
}

function Loader() {
  return (
    <div
      role="status"
      className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.625rem] tracking-[0.3em] text-subtle uppercase"
    >
      <span className="relative block h-px w-24 overflow-hidden bg-line">
        <span className="absolute inset-y-0 left-0 w-1/3 bg-accent motion-safe:animate-[loader_1.4s_var(--ease-luxe)_infinite]" />
      </span>
      Preparando el estudio
    </div>
  );
}

export function HeroStage() {
  const [mode, setMode] = useState<HeroMode | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const ref = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    let cancelled = false;
    // En móvil: suelo sin reflejo en tiempo real y menos píxeles (batería y temperatura).
    if (window.matchMedia("(pointer: coarse)").matches) setQuality("low");
    detectHeroMode().then((m) => {
      if (cancelled) return;
      if (m === "webgl") {
        // El póster es el mismo fotograma que la escena: el relevo no se nota.
        afterFirstInteraction(LOAD_3D_FALLBACK_MS).then(() => !cancelled && setMode("webgl"));
      } else setMode(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Pausa el render 3D cuando el hero no se ve (ahorra batería y CPU).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Parallax: posición del puntero normalizada en [-1, 1].
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      heroState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      heroState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 -z-10 bg-bg" data-hero-mode={mode ?? "pending"}>
      <Poster hidden={ready} />
      {mode === "webgl" && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-[1200ms]",
            !ready && "opacity-0",
          )}
        >
          <CarScene onReady={onReady} paused={!visible} quality={quality} />
        </div>
      )}
      {mode === "sequence" && <TurntableSequence onReady={onReady} />}
      {mode === "webgl" && !ready && <Loader />}
    </div>
  );
}
