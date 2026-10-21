"use client";

import dynamic from "next/dynamic";

/*
 * Piezas globales que no aportan nada al primer pintado: se cargan en chunks aparte después
 * de hidratar, para no competir con el LCP (comparador, scroll suave, cursor, transiciones y
 * precarga de enlaces por intención).
 */
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
  return (
    <>
      <CompareTray />
      <SmoothScroll />
      <CustomCursor />
      <ViewTransitions />
      <IntentPrefetch />
    </>
  );
}
