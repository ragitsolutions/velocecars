"use client";

import { useEffect, useRef, useState } from "react";

export const CURSOR_STORAGE_KEY = "vc-cursor";
export const CURSOR_TOGGLE_EVENT = "vc:cursor-toggle";

export function readCursorPreference() {
  try {
    return localStorage.getItem(CURSOR_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Cursor personalizado de escritorio: punto + anillo que crece sobre enlaces y muestra
 * «Ver» sobre los elementos con data-cursor="ver" (tarjetas de vehículo).
 * Solo con ratón, sin reduced-motion y si el usuario no lo ha desactivado (footer).
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const evaluate = () =>
      setEnabled(
        window.matchMedia("(pointer: fine)").matches &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
          readCursorPreference(),
      );
    evaluate();
    window.addEventListener(CURSOR_TOGGLE_EVENT, evaluate);
    return () => window.removeEventListener(CURSOR_TOGGLE_EVENT, evaluate);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("has-custom-cursor", enabled);
    if (!enabled) return;

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let state: "default" | "link" | "view" = "default";
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        dot.current?.style.setProperty("opacity", "1");
        ring.current?.style.setProperty("opacity", "1");
      }
      const target = e.target as Element | null;
      const next = target?.closest("[data-cursor='ver']")
        ? "view"
        : target?.closest("a, button, [role='button'], summary, label, select")
          ? "link"
          : "default";
      if (next !== state) {
        state = next;
        ring.current?.setAttribute("data-state", state);
        if (label.current) label.current.textContent = state === "view" ? "Ver" : "";
      }
    };
    const onLeave = () => {
      visible = false;
      dot.current?.style.setProperty("opacity", "0");
      ring.current?.style.setProperty("opacity", "0");
    };
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      dot.current?.style.setProperty("transform", `translate3d(${pos.x}px, ${pos.y}px, 0)`);
      ring.current?.style.setProperty(
        "transform",
        `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`,
      );
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden data-custom-cursor className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={dot}
        className="absolute top-0 left-0 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-fg opacity-0 mix-blend-difference"
      />
      <div
        ref={ring}
        data-state="default"
        className="custom-cursor-ring absolute top-0 left-0 opacity-0"
      >
        <span
          ref={label}
          className="text-[0.625rem] font-semibold tracking-[0.2em] text-inverse uppercase"
        />
      </div>
    </div>
  );
}
