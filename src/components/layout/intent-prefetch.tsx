"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Precarga por intención para los enlaces internos (ver components/ui/link.tsx): al pasar el
 * ratón, enfocar o empezar a tocar un enlace, se precarga su página una sola vez.
 */
export function IntentPrefetch() {
  const router = useRouter();
  useEffect(() => {
    const done = new Set<string>();
    const onIntent = (e: Event) => {
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      const href = url.pathname + url.search;
      if (href === location.pathname + location.search || done.has(href)) return;
      done.add(href);
      router.prefetch(href);
    };
    const opts = { capture: true, passive: true } as const;
    document.addEventListener("pointerover", onIntent, opts);
    document.addEventListener("focusin", onIntent, opts);
    document.addEventListener("touchstart", onIntent, opts);
    return () => {
      document.removeEventListener("pointerover", onIntent, opts);
      document.removeEventListener("focusin", onIntent, opts);
      document.removeEventListener("touchstart", onIntent, opts);
    };
  }, [router]);
  return null;
}
