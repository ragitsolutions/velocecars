"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/format";
import { useInventory } from "./inventory-context";
import { persistedUi } from "./persisted-ui";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Resultados con animación de layout: al filtrar u ordenar, las tarjetas que siguen se
 * recolocan deslizándose y las nuevas entran con un fade-up. Técnica FLIP con la Web
 * Animations API (sin librería): se guarda la posición de cada tarjeta, y tras el cambio se
 * anima desde la posición anterior a la nueva. Las tarjetas llegan renderizadas del servidor.
 */
export function ResultsGrid({ items }: { items: { id: string; node: ReactNode }[] }) {
  const { view, pending } = useInventory();
  const list = useRef<HTMLUListElement>(null);
  const mounted = useRef(false);
  const key = items.map((i) => i.id).join(",") + view;

  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const measure = () => {
      const origin = ul.getBoundingClientRect();
      const map = new Map<string, { x: number; y: number }>();
      for (const el of ul.children as HTMLCollectionOf<HTMLElement>) {
        const r = el.getBoundingClientRect();
        map.set(el.dataset.id!, { x: r.left - origin.left, y: r.top - origin.top });
      }
      return map;
    };
    // Montaje nuevo (carga o llegada desde otra página): nada que animar; se mide después del
    // primer pintado (medir aquí forzaba una maquetación síncrona antes de pintar). Si el
    // montaje viene de aplicar un filtro (cambio estática ↔ filtrada), se anima desde las
    // posiciones guardadas.
    const fresh = !mounted.current && !persistedUi.filtering;
    mounted.current = true;
    persistedUi.filtering = false;
    const prev = fresh ? null : persistedUi.positions;
    if (!prev) {
      let timer = 0;
      const frame = requestAnimationFrame(() => {
        timer = window.setTimeout(() => (persistedUi.positions = measure()), 0);
      });
      return () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(timer);
      };
    }
    const next = measure();
    const nodes = [...ul.children] as HTMLElement[];
    persistedUi.positions = next;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    nodes.forEach((el, i) => {
      const from = prev.get(el.dataset.id!);
      const to = next.get(el.dataset.id!)!;
      if (from) {
        const dx = from.x - to.x;
        const dy = from.y - to.y;
        if (dx || dy) {
          el.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
            { duration: 450, easing: EASE },
          );
        }
      } else {
        el.animate(
          [
            { opacity: 0, transform: "translateY(24px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 450, easing: EASE, delay: Math.min(i, 8) * 30, fill: "backwards" },
        );
      }
    });
  }, [key]);

  return (
    <ul
      ref={list}
      className={cn(
        // Desde la 2.ª tarjeta no se maquetan hasta acercarse (menos trabajo antes del primer
        // pintado). Las que están en pantalla se pintan igual; en móvil, la foto de las
        // siguientes empieza a descargarse a media pantalla de distancia.
        "grid gap-6 transition-opacity duration-300 [&>li:nth-child(n+2)]:[contain-intrinsic-height:auto_34rem] [&>li:nth-child(n+2)]:[content-visibility:auto]",
        view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
        pending && "opacity-50",
      )}
      aria-busy={pending}
    >
      {items.map((item) => (
        <li key={item.id} data-id={item.id}>
          {item.node}
        </li>
      ))}
    </ul>
  );
}
