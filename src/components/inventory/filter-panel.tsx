"use client";

import { useEffect, useId, useState } from "react";
import { Search } from "lucide-react";
import type { FacetOption } from "@/lib/inventory/query";
import type { InventoryQuery } from "@/lib/inventory/types";
import { cn, formatKm, formatNumber, formatPrice } from "@/lib/utils/format";
import { useInventory } from "./inventory-context";
import { RangeSlider } from "./range-slider";

function Group({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-line py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold tracking-[0.18em] text-fg uppercase [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden
          className="text-accent transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  );
}

/** Lista de casillas con recuento (marcas, modelos). */
function CheckList({
  options,
  selected,
  onChange,
  limit = 8,
}: {
  options: FacetOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const visible = expanded ? options : options.slice(0, limit);
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  return (
    <div>
      <ul className="space-y-1">
        {visible.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <li key={o.value}>
              <label
                htmlFor={`${id}-${o.value}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 py-1.5 text-sm transition-colors",
                  checked ? "text-fg" : "text-muted hover:text-fg",
                  o.count === 0 && !checked && "opacity-40",
                )}
              >
                <input
                  id={`${id}-${o.value}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.value)}
                  className="size-4 shrink-0 appearance-none border border-line-strong bg-bg checked:border-accent checked:bg-accent checked:shadow-[inset_0_0_0_3px_var(--bg-primary)]"
                />
                <span className="flex-1">{o.label}</span>
                <span className="tabular text-xs text-subtle">{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {options.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-xs text-accent underline-offset-4 hover:underline"
        >
          {expanded ? "Ver menos" : `Ver las ${options.length}`}
        </button>
      )}
    </div>
  );
}

/** Chips seleccionables (combustible, cambio, carrocería, estado, color). */
function Chips({
  options,
  selected,
  onChange,
}: {
  options: FacetOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() =>
              onChange(on ? selected.filter((v) => v !== o.value) : [...selected, o.value])
            }
            className={cn(
              "inline-flex items-center gap-2 border px-3 py-1.5 text-xs transition-colors duration-300",
              on
                ? "border-accent bg-accent text-inverse"
                : "border-line text-muted hover:border-accent hover:text-fg",
              o.count === 0 && !on && "opacity-40",
            )}
          >
            {o.label}
            <span className={cn("tabular", on ? "text-inverse/70" : "text-subtle")}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}

function SearchField() {
  const { query, apply } = useInventory();
  const [value, setValue] = useState(query.q ?? "");
  useEffect(() => setValue(query.q ?? ""), [query.q]);
  useEffect(() => {
    if ((query.q ?? "") === value.trim()) return;
    const t = setTimeout(() => apply({ q: value.trim() || undefined }), 450);
    return () => clearTimeout(t);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <label className="flex items-center border border-line-strong focus-within:border-accent">
      <span className="sr-only">Buscar en el inventario</span>
      <Search className="ml-3 size-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Marca, modelo, versión…"
        className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm placeholder:text-subtle focus:outline-none"
      />
    </label>
  );
}

/** Panel de filtros (barra lateral en escritorio; dentro de un panel deslizante en móvil). */
export function FilterPanel() {
  const { query, facets, apply } = useInventory();
  const { bounds } = facets;
  const set = (patch: Partial<InventoryQuery>) => apply(patch);

  return (
    <div>
      <SearchField />

      <Group title="Marca">
        <CheckList
          options={facets.brands}
          selected={query.brands ?? []}
          onChange={(brands) => set({ brands, models: [] })}
        />
      </Group>

      {facets.models.length > 0 && (
        <Group title="Modelo">
          <CheckList
            options={facets.models}
            selected={query.models ?? []}
            onChange={(models) => set({ models })}
          />
        </Group>
      )}

      <Group title="Precio">
        <RangeSlider
          label="Precio"
          min={0}
          max={bounds.price[1]}
          step={5000}
          value={[query.priceMin ?? 0, query.priceMax ?? bounds.price[1]]}
          format={formatPrice}
          onCommit={([lo, hi]) =>
            set({ priceMin: lo || undefined, priceMax: hi! >= bounds.price[1] ? undefined : hi })
          }
        />
      </Group>

      <Group title="Año">
        <RangeSlider
          label="Año"
          min={bounds.year[0]}
          max={bounds.year[1]}
          step={1}
          value={[query.yearMin ?? bounds.year[0], query.yearMax ?? bounds.year[1]]}
          format={String}
          onCommit={([lo, hi]) =>
            set({
              yearMin: lo! <= bounds.year[0] ? undefined : lo,
              yearMax: hi! >= bounds.year[1] ? undefined : hi,
            })
          }
        />
      </Group>

      <Group title="Kilómetros">
        <RangeSlider
          label="Kilómetros máximos"
          min={0}
          max={bounds.km[1]}
          step={5000}
          value={[query.kmMax ?? bounds.km[1]]}
          format={(n) => `Hasta ${formatKm(n)}`}
          onCommit={([km]) => set({ kmMax: km! >= bounds.km[1] ? undefined : km })}
        />
      </Group>

      <Group title="Potencia">
        <RangeSlider
          label="Potencia mínima"
          min={0}
          max={bounds.power[1]}
          step={10}
          value={[query.powerMin ?? 0]}
          format={(n) => `Desde ${formatNumber(n)} CV`}
          onCommit={([cv]) => set({ powerMin: cv || undefined })}
        />
      </Group>

      <Group title="Carrocería">
        <Chips
          options={facets.bodyTypes}
          selected={query.bodyTypes ?? []}
          onChange={(v) => set({ bodyTypes: v as InventoryQuery["bodyTypes"] })}
        />
      </Group>

      <Group title="Combustible">
        <Chips
          options={facets.fuels}
          selected={query.fuels ?? []}
          onChange={(v) => set({ fuels: v as InventoryQuery["fuels"] })}
        />
      </Group>

      <Group title="Cambio">
        <Chips
          options={facets.transmissions}
          selected={query.transmissions ?? []}
          onChange={(v) => set({ transmissions: v as InventoryQuery["transmissions"] })}
        />
      </Group>

      <Group title="Estado" defaultOpen={false}>
        <Chips
          options={facets.conditions}
          selected={query.conditions ?? []}
          onChange={(v) => set({ conditions: v as InventoryQuery["conditions"] })}
        />
      </Group>

      <Group title="Color" defaultOpen={false}>
        <Chips
          options={facets.colors}
          selected={(query.colors ?? []).map(
            (c) => facets.colors.find((o) => o.value.toLowerCase() === c.toLowerCase())?.value ?? c,
          )}
          onChange={(v) => set({ colors: v.map((c) => c.toLowerCase()) })}
        />
      </Group>
    </div>
  );
}
