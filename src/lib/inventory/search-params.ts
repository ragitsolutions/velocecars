import {
  BODY_TYPES,
  CONDITIONS,
  FUELS,
  TRANSMISSIONS,
  type BodyType,
  type Condition,
  type Fuel,
  type InventoryQuery,
  type SortKey,
  type Transmission,
} from "./types";

/**
 * Estado del inventario en la URL, en español y compartible:
 *   /vehiculos?marca=porsche,ferrari&carroceria=coupe&precio_max=150000&orden=precio-asc&pagina=2
 * Las landings por marca usan la misma lógica con `marca` fijada por la ruta.
 */

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function slugMap<T extends string>(values: readonly T[]) {
  const to = Object.fromEntries(values.map((v) => [v, slug(v)])) as Record<T, string>;
  const from = Object.fromEntries(values.map((v) => [slug(v), v])) as Record<string, T>;
  return { to, from };
}

export const bodySlugs = slugMap<BodyType>(BODY_TYPES);
export const fuelSlugs = slugMap<Fuel>(FUELS);
export const transmissionSlugs = slugMap<Transmission>(TRANSMISSIONS);
export const conditionSlugs = slugMap<Condition>(CONDITIONS);

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "recientes", label: "Recién llegados" },
  { value: "precio-asc", label: "Precio: de menor a mayor" },
  { value: "precio-desc", label: "Precio: de mayor a menor" },
  { value: "km-asc", label: "Menos kilómetros" },
  { value: "anio-desc", label: "Más recientes (año)" },
  { value: "potencia-desc", label: "Más potencia" },
];

export const PAGE_SIZE = 12;

type Params = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v.join(",") : (v ?? ""))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const num = (v: string | string[] | undefined) => {
  const n = Number(first(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const mapList = <T extends string>(v: string | string[] | undefined, from: Record<string, T>) =>
  list(v)
    .map((s) => from[s])
    .filter((x): x is T => Boolean(x));

export function parseInventoryParams(params: Params): InventoryQuery {
  const sort = first(params.orden) as SortKey | undefined;
  return {
    q: first(params.q)?.trim() || undefined,
    brands: list(params.marca),
    models: list(params.modelo),
    priceMin: num(params.precio_min),
    priceMax: num(params.precio_max),
    yearMin: num(params.anio_min),
    yearMax: num(params.anio_max),
    kmMax: num(params.km_max),
    powerMin: num(params.potencia_min),
    fuels: mapList(params.combustible, fuelSlugs.from),
    transmissions: mapList(params.cambio, transmissionSlugs.from),
    bodyTypes: mapList(params.carroceria, bodySlugs.from),
    conditions: mapList(params.estado, conditionSlugs.from),
    colors: list(params.color),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : undefined,
    page: num(params.pagina),
    pageSize: PAGE_SIZE,
  };
}

/** Inverso de parseInventoryParams: omite los valores vacíos o por defecto. */
export function toInventoryParams(q: InventoryQuery): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: string | number | undefined) => {
    if (v !== undefined && v !== "") p.set(k, String(v));
  };
  set("q", q.q);
  if (q.brands?.length) set("marca", q.brands.join(","));
  if (q.models?.length) set("modelo", q.models.join(","));
  set("precio_min", q.priceMin);
  set("precio_max", q.priceMax);
  set("anio_min", q.yearMin);
  set("anio_max", q.yearMax);
  set("km_max", q.kmMax);
  set("potencia_min", q.powerMin);
  if (q.fuels?.length) set("combustible", q.fuels.map((f) => fuelSlugs.to[f]).join(","));
  if (q.transmissions?.length)
    set("cambio", q.transmissions.map((t) => transmissionSlugs.to[t]).join(","));
  if (q.bodyTypes?.length) set("carroceria", q.bodyTypes.map((b) => bodySlugs.to[b]).join(","));
  if (q.conditions?.length) set("estado", q.conditions.map((c) => conditionSlugs.to[c]).join(","));
  if (q.colors?.length) set("color", q.colors.join(","));
  if (q.sort && q.sort !== "destacados") set("orden", q.sort);
  if (q.page && q.page > 1) set("pagina", q.page);
  return p;
}

export const inventoryHref = (q: InventoryQuery) => {
  const qs = toInventoryParams(q).toString();
  return qs ? `/vehiculos?${qs}` : "/vehiculos";
};
