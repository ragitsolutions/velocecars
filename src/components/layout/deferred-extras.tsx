"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/*
 * Piezas globales que no aportan nada al primer pintado: se cargan en chunks aparte después
 * de hidratar, para no competir con el LCP (comparador, scroll suave, cursor, transiciones y
 * precarga de enlaces por intención). El scroll suave y el cursor solo con ratón: en pantallas
 * táctiles no hacen nada (Lenis no suaviza el scroll táctil) y el bucle de animación de Lenis
 * gastaba CPU y batería en cada fotograma.
 */
const FINE_POINTER = "(pointer: fine)";
const subscribeFinePointer = (onChange: () => void) => {
  const mql = window.matchMedia(FINE_POINTER);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};
const CompareTray = dynamic(
  () => import("@/components/inventory/compare-tray").then((m) => m.CompareTray),
  {
    ssr: false,
  },
);
const SmoothScroll = dynamic(
  () => import("@/components/motion/smooth-scroll").then((m) => m.SmoothScroll),
  {
    ssr: false,
  },
);
const CustomCursor = dynamic(
  () => import("@/components/motion/custom-cursor").then((m) => m.CustomCursor),
  {
    ssr: false,
  },
);
const ViewTransitions = dynamic(
  () => import("@/components/motion/view-transitions").then((m) => m.ViewTransitions),
  { ssr: false },
);

const IntentPrefetch = dynamic(() => import("./intent-prefetch").then((m) => m.IntentPrefetch), {
  ssr: false,
});

export function DeferredExtras() {
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
  return (
    <>
      <CompareTray />
      {finePointer && <SmoothScroll />}
      {finePointer && <CustomCursor />}
      <ViewTransitions />
      <IntentPrefetch />
    </>
  );
}
