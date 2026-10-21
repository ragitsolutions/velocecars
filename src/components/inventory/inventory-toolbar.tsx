"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLayoutEffect, useRef, useState } from "react";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { bodySlugs, SORT_OPTIONS } from "@/lib/inventory/search-params";
import type { InventoryQuery, SortKey } from "@/lib/inventory/types";
import { cn, formatKm, formatNumber, formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { FavoritesDrawer } from "./favorites-drawer";
import { FilterPanel } from "./filter-panel";
import { useInventory } from "./inventory-context";
import { persistedUi } from "./persisted-ui";

function MobileFilters() {
  const { total, clear } = useInventory();
  // Abierto y con su scroll aunque la página se vuelva a montar al filtrar (ver persisted-ui).
  const [open, setOpen] = useState(persistedUi.mobileFiltersOpen);
  const [restored] = useState(persistedUi.mobileFiltersOpen);
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (open && list.current) list.current.scrollTop = persistedUi.mobileFiltersScroll;
  }, [open]);
  const onOpenChange = (next: boolean) => {
    persistedUi.mobileFiltersOpen = next;
    if (!next) persistedUi.mobileFiltersScroll = 0;
    setOpen(next);
  };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger className="inline-flex h-11 items-center gap-2 border border-line-strong px-4 text-xs font-semibold tracking-[0.14em] uppercase lg:hidden">
        <SlidersHorizontal className="size-4" strokeWidth={1.5} aria-hidden /> Filtros
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          data-lenis-prevent
          className={cn(
            "fixed inset-y-0 left-0 z-[var(--z-modal)] flex w-[min(24rem,100vw)] flex-col border-r border-line bg-bg-elevated",
            !restored && "data-[state=open]:animate-[slide-in-left_400ms_var(--ease-luxe)]",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <Dialog.Title className="font-display text-2xl">Filtros</Dialog.Title>
            <Dialog.Close aria-label="Cerrar filtros" className="p-1 text-muted hover:text-fg">
              <X className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Filtra el inventario de vehículos.
          </Dialog.Description>
          <div
            ref={list}
            onScroll={(e) => (persistedUi.mobileFiltersScroll = e.currentTarget.scrollTop)}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            <FilterPanel />
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
            <Button size="sm" variant="ghost" onClick={clear}>
              Limpiar
            </Button>
            <Dialog.Close asChild>
              <Button size="sm" variant="solid">
                Ver {formatNumber(total)}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function InventoryToolbar() {
  const { total, query, apply, view, setView, pending } = useInventory();
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
      <p className="text-sm text-muted" aria-live="polite">
        <span className="tabular font-display text-2xl text-fg">{formatNumber(total)}</span>{" "}
        {total === 1 ? "vehículo" : "vehículos"}
        {pending && <span className="ml-3 text-xs text-subtle">Actualizando…</span>}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <MobileFilters />
        <FavoritesDrawer />
        <label className="relative inline-flex h-11 items-center border border-line-strong">
          <span className="sr-only">Ordenar por</span>
          <select
            value={query.sort ?? "destacados"}
            onChange={(e) => apply({ sort: e.target.value as SortKey })}
            className="h-full appearance-none bg-transparent pr-9 pl-4 text-xs font-semibold tracking-[0.1em] text-fg uppercase focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-bg-elevated normal-case">
                {o.label}
              </option>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute right-3 text-xs text-muted">
            ▾
          </span>
        </label>
        <div
          className="hidden h-11 border border-line-strong sm:flex"
          role="group"
          aria-label="Vista"
        >
          {(
            [
              ["grid", "Rejilla", LayoutGrid],
              ["list", "Lista", List],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              aria-label={`Vista en ${label.toLowerCase()}`}
              onClick={() => setView(value)}
              className={cn(
                "grid w-11 place-items-center transition-colors",
                view === value ? "bg-accent text-inverse" : "text-muted hover:text-fg",
              )}
            >
              <Icon className="size-4" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Chips de los filtros aplicados; cada uno se quita individualmente. */
export function ActiveFilters() {
  const { query, facets, apply, clear } = useInventory();
  const chips: { key: string; label: string; remove: Partial<InventoryQuery> }[] = [];
  const brandName = (slug: string) => facets.brands.find((b) => b.value === slug)?.label ?? slug;

  if (query.q) chips.push({ key: "q", label: `«${query.q}»`, remove: { q: undefined } });
  for (const b of query.brands ?? [])
    chips.push({
      key: `b-${b}`,
      label: brandName(b),
      remove: { brands: query.brands!.filter((x) => x !== b), models: [] },
    });
  for (const m of query.models ?? [])
    chips.push({
      key: `m-${m}`,
      label: m,
      remove: { models: query.models!.filter((x) => x !== m) },
    });
  if (query.priceMin)
    chips.push({
      key: "pmin",
      label: `Desde ${formatPrice(query.priceMin)}`,
      remove: { priceMin: undefined },
    });
  if (query.priceMax)
    chips.push({
      key: "pmax",
      label: `Hasta ${formatPrice(query.priceMax)}`,
      remove: { priceMax: undefined },
    });
  if (query.yearMin)
    chips.push({ key: "ymin", label: `Desde ${query.yearMin}`, remove: { yearMin: undefined } });
  if (query.yearMax)
    chips.push({ key: "ymax", label: `Hasta ${query.yearMax}`, remove: { yearMax: undefined } });
  if (query.kmMax)
    chips.push({
      key: "km",
      label: `Hasta ${formatKm(query.kmMax)}`,
      remove: { kmMax: undefined },
    });
  if (query.powerMin)
    chips.push({ key: "cv", label: `Desde ${query.powerMin} CV`, remove: { powerMin: undefined } });
  for (const b of query.bodyTypes ?? [])
    chips.push({
      key: `body-${bodySlugs.to[b]}`,
      label: b,
      remove: { bodyTypes: query.bodyTypes!.filter((x) => x !== b) },
    });
  for (const f of query.fuels ?? [])
    chips.push({ key: `f-${f}`, label: f, remove: { fuels: query.fuels!.filter((x) => x !== f) } });
  for (const t of query.transmissions ?? [])
    chips.push({
      key: `t-${t}`,
      label: t,
      remove: { transmissions: query.transmissions!.filter((x) => x !== t) },
    });
  for (const c of query.conditions ?? [])
    chips.push({
      key: `c-${c}`,
      label: c,
      remove: { conditions: query.conditions!.filter((x) => x !== c) },
    });
  for (const c of query.colors ?? [])
    chips.push({
      key: `col-${c}`,
      label: c.charAt(0).toUpperCase() + c.slice(1),
      remove: { colors: query.colors!.filter((x) => x !== c) },
    });

  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 pt-5">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => apply(c.remove)}
          aria-label={`Quitar filtro ${c.label}`}
          className="inline-flex items-center gap-2 border border-accent/50 px-3 py-1.5 text-xs text-fg hover:border-accent motion-safe:animate-[pop-in_250ms_var(--ease-luxe)]"
        >
          {c.label}
          <X className="size-3 text-accent" strokeWidth={2} aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={clear}
        className="ml-2 text-xs text-muted underline underline-offset-4 hover:text-fg"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
