"use client";

import { GitCompareArrows, Heart } from "lucide-react";
import { useState } from "react";
import { COMPARE_KEY, COMPARE_MAX, FAVORITES_KEY, useStoredIds } from "@/hooks/use-stored-ids";
import { cn } from "@/lib/utils/format";

/** Favorito y «comparar» sobre la tarjeta (por encima del enlace que cubre la tarjeta). */
export function VehicleCardActions({
  id,
  name,
  className = "absolute top-3 right-3 z-10",
}: {
  id: string;
  name: string;
  className?: string;
}) {
  const favorites = useStoredIds(FAVORITES_KEY);
  const compare = useStoredIds(COMPARE_KEY, COMPARE_MAX);
  const [warning, setWarning] = useState(false);
  const isFav = favorites.has(id);
  const inCompare = compare.has(id);

  const button =
    "grid size-9 place-items-center border backdrop-blur-md transition-colors duration-300";

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={() => favorites.toggle(id)}
        aria-pressed={isFav}
        aria-label={isFav ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
        className={cn(
          button,
          isFav
            ? "border-accent bg-accent text-inverse"
            : "border-line-strong bg-bg/60 text-fg hover:border-accent",
        )}
      >
        <Heart className={cn("size-4", isFav && "fill-current")} strokeWidth={1.5} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => {
          const ok = compare.toggle(id);
          setWarning(!ok);
          if (!ok) setTimeout(() => setWarning(false), 2500);
        }}
        aria-pressed={inCompare}
        aria-label={inCompare ? `Quitar ${name} del comparador` : `Añadir ${name} al comparador`}
        className={cn(
          button,
          inCompare
            ? "border-accent bg-accent text-inverse"
            : "border-line-strong bg-bg/60 text-fg hover:border-accent",
        )}
      >
        <GitCompareArrows className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
      {warning && (
        <p
          role="status"
          className="absolute top-11 right-0 w-48 border border-line-strong bg-bg-elevated p-2 text-xs text-fg"
        >
          Puedes comparar hasta {COMPARE_MAX} vehículos.
        </p>
      )}
    </div>
  );
}
