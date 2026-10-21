import type {
  BrandSummary,
  InventoryFilters,
  InventoryQuery,
  InventoryResult,
  SortKey,
  Vehicle,
} from "./types";

/** Funciones puras de filtrado, orden y paginación (sin E/S: reutilizables en cliente y tests). */

export const DEFAULT_PAGE_SIZE = 12;

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const inList = <T>(list: T[] | undefined, value: T) => !list?.length || list.includes(value);

export function matchesFilters(v: Vehicle, f: InventoryFilters): boolean {
  if (!inList(f.statuses ?? ["disponible", "reservado"], v.status)) return false;
  if (f.brands?.length && !f.brands.includes(v.brandSlug)) return false;
  if (f.models?.length && !f.models.some((m) => normalize(m) === normalize(v.model))) return false;
  if (f.priceMin !== undefined && v.price < f.priceMin) return false;
  if (f.priceMax !== undefined && v.price > f.priceMax) return false;
  if (f.yearMin !== undefined && v.year < f.yearMin) return false;
  if (f.yearMax !== undefined && v.year > f.yearMax) return false;
  if (f.kmMax !== undefined && v.mileageKm > f.kmMax) return false;
  if (f.powerMin !== undefined && v.powerCv < f.powerMin) return false;
  if (!inList(f.fuels, v.fuel)) return false;
  if (!inList(f.transmissions, v.transmission)) return false;
  if (!inList(f.bodyTypes, v.bodyType)) return false;
  if (!inList(f.conditions, v.condition)) return false;
  if (f.colors?.length && !f.colors.some((c) => normalize(v.color).startsWith(normalize(c)))) {
    return false;
  }
  if (f.q) {
    const haystack = normalize(
      [v.brand, v.model, v.version, v.year, v.color, v.fuel, v.bodyType].join(" "),
    );
    if (
      !normalize(f.q)
        .split(/\s+/)
        .filter(Boolean)
        .every((term) => haystack.includes(term))
    ) {
      return false;
    }
  }
  return true;
}

const comparators: Record<SortKey, (a: Vehicle, b: Vehicle) => number> = {
  // Los destacados primero; después, el orden en el que el cliente los cargó.
  destacados: (a, b) => Number(b.featured) - Number(a.featured),
  "precio-asc": (a, b) => a.price - b.price,
  "precio-desc": (a, b) => b.price - a.price,
  "km-asc": (a, b) => a.mileageKm - b.mileageKm,
  "anio-desc": (a, b) => b.year - a.year,
  "potencia-desc": (a, b) => b.powerCv - a.powerCv,
  recientes: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
};

export function sortVehicles(list: Vehicle[], sort: SortKey = "destacados"): Vehicle[] {
  // Array.prototype.sort es estable: en empate se conserva el orden de origen.
  return [...list].sort(comparators[sort]);
}

export function queryVehicles(all: Vehicle[], query: InventoryQuery = {}): InventoryResult {
  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
  const filtered = sortVehicles(
    all.filter((v) => matchesFilters(v, query)),
    query.sort,
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
    pageCount,
  };
}

export function summarizeBrands(all: Vehicle[]): BrandSummary[] {
  const map = new Map<string, BrandSummary>();
  for (const v of all) {
    if (v.status === "vendido") continue;
    const entry = map.get(v.brandSlug) ?? {
      name: v.brand,
      slug: v.brandSlug,
      count: 0,
      models: [],
    };
    entry.count++;
    if (!entry.models.includes(v.model)) entry.models.push(v.model);
    map.set(v.brandSlug, entry);
  }
  return [...map.values()]
    .map((b) => ({ ...b, models: b.models.sort((x, y) => x.localeCompare(y, "es")) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
}

/** Coches parecidos: misma marca o precio en ±30 %, priorizando la marca. */
export function similarVehicles(all: Vehicle[], target: Vehicle, limit = 4): Vehicle[] {
  const score = (v: Vehicle) =>
    (v.brandSlug === target.brandSlug ? 2 : 0) +
    (v.bodyType === target.bodyType ? 1 : 0) +
    (Math.abs(v.price - target.price) / target.price <= 0.3 ? 1 : 0);
  return all
    .filter((v) => v.id !== target.id && v.status !== "vendido" && score(v) >= 2)
    .sort(
      (a, b) =>
        score(b) - score(a) || Math.abs(a.price - target.price) - Math.abs(b.price - target.price),
    )
    .slice(0, limit);
}

export function inventoryStats(all: Vehicle[]) {
  const available = all.filter((v) => v.status !== "vendido");
  const prices = available.map((v) => v.price);
  return {
    count: available.length,
    brands: new Set(available.map((v) => v.brandSlug)).size,
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
    yearMin: available.length ? Math.min(...available.map((v) => v.year)) : 0,
    yearMax: available.length ? Math.max(...available.map((v) => v.year)) : 0,
  };
}

/** Recuento de vehículos disponibles por valor (para chips y filtros con contador). */
export function countBy<K extends string>(all: Vehicle[], key: (v: Vehicle) => K) {
  const map = new Map<K, number>();
  for (const v of all) {
    if (v.status === "vendido") continue;
    map.set(key(v), (map.get(key(v)) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export type FacetOption = { value: string; label: string; count: number };

export type InventoryFacets = {
  brands: FacetOption[];
  models: FacetOption[];
  fuels: FacetOption[];
  transmissions: FacetOption[];
  bodyTypes: FacetOption[];
  conditions: FacetOption[];
  colors: FacetOption[];
  bounds: {
    price: [number, number];
    year: [number, number];
    km: [number, number];
    power: [number, number];
  };
};

const baseColor = (color: string) => color.split(" ")[0] || color;

/**
 * Facetas del inventario. Cada grupo cuenta los vehículos que cumplen todos los filtros
 * activos salvo el propio (así se ven las alternativas sin tener que quitar nada).
 */
export function computeFacets(all: Vehicle[], q: InventoryFilters): InventoryFacets {
  const available = all.filter((v) => v.status !== "vendido");
  const without = (patch: Partial<InventoryFilters>) =>
    available.filter((v) => matchesFilters(v, { ...q, ...patch }));
  const tally = (list: Vehicle[], key: (v: Vehicle) => string, label?: (v: Vehicle) => string) => {
    const map = new Map<string, FacetOption>();
    for (const v of list) {
      const value = key(v);
      const entry = map.get(value) ?? { value, label: label ? label(v) : value, count: 0 };
      entry.count++;
      map.set(value, entry);
    }
    return [...map.values()].sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"),
    );
  };
  const range = (values: number[], step: number): [number, number] => [
    Math.floor(Math.min(...values) / step) * step,
    Math.ceil(Math.max(...values) / step) * step,
  ];

  const brandScope = without({ brands: [], models: [] });
  const modelScope = q.brands?.length ? without({ models: [] }) : [];
  return {
    brands: tally(
      brandScope,
      (v) => v.brandSlug,
      (v) => v.brand,
    ),
    models: tally(modelScope, (v) => v.model),
    fuels: tally(without({ fuels: [] }), (v) => v.fuel),
    transmissions: tally(without({ transmissions: [] }), (v) => v.transmission),
    bodyTypes: tally(without({ bodyTypes: [] }), (v) => v.bodyType),
    conditions: tally(without({ conditions: [] }), (v) => v.condition),
    colors: tally(without({ colors: [] }), (v) => baseColor(v.color)),
    bounds: {
      price: range(
        available.map((v) => v.price),
        10_000,
      ),
      year: range(
        available.map((v) => v.year),
        1,
      ),
      km: range(
        available.map((v) => v.mileageKm),
        10_000,
      ),
      power: range(available.map((v) => v.powerCv).filter(Boolean), 50),
    },
  };
}
