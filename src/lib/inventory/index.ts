import "server-only";
import { cache } from "react";
import { cmsProvider } from "./providers/cms-provider";
import { jsonProvider } from "./providers/json-provider";
import {
  computeFacets,
  countBy,
  inventoryStats,
  queryVehicles,
  similarVehicles,
  summarizeBrands,
} from "./query";
import type { InventoryProvider, InventoryQuery, Vehicle } from "./types";

export type * from "./types";

/** Selecciona la fuente de inventario con INVENTORY_PROVIDER (json por defecto). */
export function getProvider(): InventoryProvider {
  return process.env.INVENTORY_PROVIDER === "cms" ? cmsProvider : jsonProvider;
}

/** Deduplicado por petición: varias llamadas en un mismo render leen el inventario una vez. */
export const getAllVehicles = cache(() => getProvider().getAll());

export async function getVehicles(query?: InventoryQuery) {
  return queryVehicles(await getAllVehicles(), query);
}

export async function getInventoryFacets(query: InventoryQuery = {}) {
  return computeFacets(await getAllVehicles(), query);
}

export async function getVehicle(brandSlug: string, slug: string): Promise<Vehicle | null> {
  return getProvider().getBySlug(brandSlug, slug);
}

export async function getFeaturedVehicles(limit = 9) {
  const all = await getAllVehicles();
  return all.filter((v) => v.featured && v.status !== "vendido").slice(0, limit);
}

export async function getSimilarVehicles(vehicle: Vehicle, limit = 4) {
  return similarVehicles(await getAllVehicles(), vehicle, limit);
}

export async function getBrands() {
  return summarizeBrands(await getAllVehicles());
}

export async function getInventoryStats() {
  return inventoryStats(await getAllVehicles());
}

export async function getBodyTypeCounts() {
  return countBy(await getAllVehicles(), (v) => v.bodyType).map(({ value, count }) => ({
    type: value,
    count,
  }));
}
