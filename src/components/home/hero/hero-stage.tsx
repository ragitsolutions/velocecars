"use client";

import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { detectHeroMode, type HeroMode } from "@/lib/device";
import { cn } from "@/lib/utils/format";
import { HERO_POSTER, HERO_VIDEO } from "./hero-assets";

const PORTRAIT_MEDIA = "(max-aspect-ratio: 1/1)";
const LANDSCAPE_MEDIA = "(min-aspect-ratio: 1/1)";

function Poster() {
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
        className="absolute inset-0 size-full object-cover"
      />
    </picture>
  );
}

/**
 * Espera a que termine la carga de la página (o, como mucho, 2,5 s: si alguna foto tarda, el
 * giro no tiene por qué esperarla) y a un momento libre del navegador.
 */
function afterLoadIdle(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    let started = false;
    const idle = () => {
      if (started || signal.aborted) return;
      started = true;
      // Safari no tiene requestIdleCallback.
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => resolve(), { timeout: 1500 });
      } else setTimeout(resolve, 300);
    };
    if (document.readyState === "complete") idle();
    else {
      window.addEventListener("load", idle, { once: true });
      setTimeout(idle, 2500);
    }
  });
}

/**
 * Fondo del hero: póster (LCP) y, tras la carga, el giro del coche como vídeo en bucle
 * (renderizado desde la escena 3D con scripts/3d/render-turntable.mjs). Antes la escena 3D se
 * ejecutaba en el navegador: ~2,5 MB y compilación de shaders que tardaba en arrancar y en
 * algunos móviles no llegaba a moverse. El vídeo pesa ~1,2 MB y se decodifica por hardware.
 */
export function HeroStage() {
  const [mode, setMode] = useState<HeroMode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const abort = new AbortController();
    const mql = window.matchMedia(PORTRAIT_MEDIA);
    const onOrientation = () => {
      setPortrait(mql.matches);
      setPlaying(false); // vídeo de la otra orientación: vuelve a entrar con fundido
    };
    onOrientation();
    mql.addEventListener("change", onOrientation);
    const m = detectHeroMode();
    if (m === "static") setMode(m);
    else afterLoadIdle(abort.signal).then(() => setMode(m));
    return () => {
      abort.abort();
      mql.removeEventListener("change", onOrientation);
    };
  }, []);

  // Reproducir solo con el hero a la vista (ahorra batería). Si el navegador bloquea la
  // reproducción automática (p. ej. iPhone en ahorro de energía), arranca con el primer toque.
  useEffect(() => {
    const el = ref.current;
    const v = video.current;
    if (mode !== "video" || !el || !v) return;
    // iOS solo lo reproduce automáticamente si está silenciado como atributo (React solo fija
    // la propiedad).
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    let visible = true;
    const tryPlay = () => {
      if (visible) v.play().catch(() => undefined);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) tryPlay();
      else v.pause();
    });
    io.observe(el);
    const onFirstTouch = () => tryPlay();
    window.addEventListener("pointerdown", onFirstTouch, { once: true, passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointerdown", onFirstTouch);
    };
  }, [mode, portrait]);

  const src = portrait ? HERO_VIDEO.portrait.src : HERO_VIDEO.landscape.src;

  return (
    <div ref={ref} className="absolute inset-0 -z-10 bg-bg" data-hero-mode={mode ?? "pending"}>
      <Poster />
      {mode === "video" && (
        <video
          ref={video}
          key={src}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-luxe",
            !playing && "opacity-0",
          )}
        />
      )}
    </div>
  );
}
