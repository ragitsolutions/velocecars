"use client";

import { useEffect, useRef } from "react";
import { HERO_TURNTABLE } from "./hero-assets";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Fallback sin WebGL: secuencia de fotogramas 360° renderizados desde la escena 3D.
 * El giro lo controlan el scroll (media vuelta al salir del hero) y el arrastre horizontal.
 */
export function TurntableSequence({ onReady }: { onReady?: () => void }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const count = HERO_TURNTABLE.frames;

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !count) return;
    const portrait = window.innerWidth / window.innerHeight <= 1;
    const base = portrait ? HERO_TURNTABLE.portrait : HERO_TURNTABLE.landscape;
    const urls = Array.from({ length: count }, (_, i) => `${base}/${pad(i)}.webp`);

    // Precarga progresiva: primero el fotograma 0 (igual al póster) y luego el resto.
    let loaded = 0;
    const cache = urls.map((url) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        loaded++;
        if (loaded === count) onReady?.();
      };
      im.src = url;
      return im;
    });

    let drag = 0;
    let startX: number | null = null;
    let dragAtStart = 0;
    const onDown = (e: PointerEvent) => {
      startX = e.clientX;
      dragAtStart = drag;
    };
    const onMove = (e: PointerEvent) => {
      if (startX === null) return;
      drag = dragAtStart + (e.clientX - startX) / window.innerWidth;
    };
    const onUp = () => {
      startX = null;
    };
    img.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);

    let current = -1;
    let raf = 0;
    const tick = () => {
      // Media vuelta por cada pantalla de scroll mientras el hero está a la vista, más el arrastre.
      const turns =
        (Math.min(window.scrollY, window.innerHeight) / window.innerHeight) * 0.5 + drag;
      const index = (((Math.round(turns * count) % count) + count) % count) as number;
      if (index !== current && cache[index]?.complete) {
        current = index;
        img.src = urls[index]!;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      img.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [count, onReady]);

  if (!count) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- secuencia gestionada a mano fotograma a fotograma
    <img
      ref={imgRef}
      alt=""
      draggable={false}
      className="absolute inset-0 size-full cursor-grab touch-pan-y object-cover select-none active:cursor-grabbing"
    />
  );
}
