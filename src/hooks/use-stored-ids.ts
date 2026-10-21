"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Lista de IDs persistida en localStorage (favoritos, comparador), sincronizada entre todos
 * los componentes de la página y entre pestañas. Sin localStorage (modo privado estricto)
 * funciona en memoria durante la visita.
 */
const EVENT = "vc:stored-ids";
const memory = new Map<string, string>();

function read(key: string): string {
  try {
    return localStorage.getItem(key) ?? "[]";
  } catch {
    return memory.get(key) ?? "[]";
  }
}

function write(key: string, ids: string[]) {
  const value = JSON.stringify(ids);
  try {
    localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const parse = (raw: string): string[] => {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};

// Cache por clave: useSyncExternalStore exige devolver la misma referencia si no hay cambios.
const snapshots = new Map<string, { raw: string; ids: string[] }>();
const EMPTY: string[] = [];

export function useStoredIds(key: string, max = Infinity) {
  const ids = useSyncExternalStore(
    subscribe,
    () => {
      const raw = read(key);
      const cached = snapshots.get(key);
      if (cached?.raw === raw) return cached.ids;
      const next = { raw, ids: parse(raw) };
      snapshots.set(key, next);
      return next.ids;
    },
    () => EMPTY,
  );

  const toggle = useCallback(
    (id: string) => {
      const current = parse(read(key));
      if (current.includes(id)) {
        write(
          key,
          current.filter((x) => x !== id),
        );
        return true;
      }
      if (current.length >= max) return false;
      write(key, [...current, id]);
      return true;
    },
    [key, max],
  );

  const remove = useCallback(
    (id: string) =>
      write(
        key,
        parse(read(key)).filter((x) => x !== id),
      ),
    [key],
  );
  const clear = useCallback(() => write(key, []), [key]);

  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle,
    remove,
    clear,
    full: ids.length >= max,
  };
}

export const FAVORITES_KEY = "vc-favoritos";
export const COMPARE_KEY = "vc-comparar";
export const COMPARE_MAX = 3;
