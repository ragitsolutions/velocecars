"use client";

import Image from "next/image";
import { useEffect } from "react";
import Link from "@/components/ui/link";
import { X } from "lucide-react";
import { COMPARE_KEY, COMPARE_MAX, useStoredIds } from "@/hooks/use-stored-ids";
import { useVehicleSummaries } from "@/hooks/use-vehicle-summaries";
import { cn } from "@/lib/utils/format";

/** Bandeja fija del comparador: aparece al añadir el primer vehículo (máx. 3). */
export function CompareTray() {
  const compare = useStoredIds(COMPARE_KEY, COMPARE_MAX);
  const items = useVehicleSummaries(compare.ids);
  const visible = compare.ids.length > 0;

  // Marca en <html> para subir el botón de WhatsApp (antes `body:has(...)`, más costoso).
  useEffect(() => {
    document.documentElement.toggleAttribute("data-compare-open", visible);
    return () => document.documentElement.removeAttribute("data-compare-open");
  }, [visible]);

  return (
    <>
      {visible && (
        <aside
          aria-label="Comparador de vehículos"
          data-compare-tray
          className="fixed inset-x-0 bottom-0 z-[var(--z-floating)] border-t border-line-strong bg-bg-elevated/95 backdrop-blur-xl motion-safe:animate-[rise-in_500ms_var(--ease-luxe)]"
        >
          <div className="container-luxe flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex gap-3 overflow-x-auto">
              {Array.from({ length: COMPARE_MAX }, (_, i) => {
                const item = items[i];
                const id = compare.ids[i];
                return (
                  <li
                    key={id ?? `vacio-${i}`}
                    className={cn(
                      "relative flex h-16 w-44 shrink-0 items-center gap-3 border p-1.5 pr-8",
                      id ? "border-line-strong" : "border-dashed border-line",
                    )}
                  >
                    {item ? (
                      <>
                        <span className="relative h-full w-16 shrink-0 overflow-hidden bg-bg">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          )}
                        </span>
                        <span className="min-w-0 text-xs leading-tight">
                          <span className="block truncate text-fg">{item.brand}</span>
                          <span className="block truncate text-muted">{item.model}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => compare.remove(item.id)}
                          aria-label={`Quitar ${item.brand} ${item.model} del comparador`}
                          className="absolute top-1 right-1 p-1 text-muted hover:text-fg"
                        >
                          <X className="size-3.5" strokeWidth={1.5} />
                        </button>
                      </>
                    ) : (
                      <span className="px-2 text-xs text-subtle">
                        {id ? "Cargando…" : "Añade un vehículo"}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={compare.clear}
                className="text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
              >
                Vaciar
              </button>
              <Link
                href={`/vehiculos/comparar?ids=${compare.ids.join(",")}`}
                aria-disabled={compare.ids.length < 2}
                className={cn(
                  "inline-flex h-11 items-center bg-accent px-6 text-xs font-semibold tracking-[0.16em] text-inverse uppercase transition-colors hover:bg-accent-hover",
                  compare.ids.length < 2 && "pointer-events-none opacity-40",
                )}
              >
                Comparar ({compare.ids.length})
              </Link>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
