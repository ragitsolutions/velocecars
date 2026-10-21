"use client";

import { useEffect, useState } from "react";
import { CURSOR_STORAGE_KEY, CURSOR_TOGGLE_EVENT, readCursorPreference } from "./custom-cursor";

/** Botón del footer para activar o desactivar el cursor personalizado (se recuerda). */
export function CursorToggle() {
  const [on, setOn] = useState(true);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(window.matchMedia("(pointer: fine)").matches);
    setOn(readCursorPreference());
  }, []);

  if (!available) return null;
  return (
    <button
      type="button"
      className="hover:text-fg"
      aria-pressed={on}
      onClick={() => {
        const next = !on;
        setOn(next);
        try {
          localStorage.setItem(CURSOR_STORAGE_KEY, next ? "on" : "off");
        } catch {
          // Sin almacenamiento: el cambio dura hasta recargar.
        }
        window.dispatchEvent(new Event(CURSOR_TOGGLE_EVENT));
      }}
    >
      Cursor personalizado: {on ? "activado" : "desactivado"}
    </button>
  );
}
