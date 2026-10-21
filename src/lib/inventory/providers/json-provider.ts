import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { vehiclesFileSchema } from "../schema";
import type { InventoryProvider, Vehicle } from "../types";

const DATA_FILE = path.join(process.cwd(), "data", "vehicles.json");
const MANIFEST_FILE = path.join(process.cwd(), "data", "image-manifest.json");
/** En desarrollo se relee el JSON para ver los cambios sin reiniciar. */
const TTL_MS = process.env.NODE_ENV === "production" ? 5 * 60_000 : 2_000;

let cache: { at: number; data: Vehicle[] } | null = null;

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Sustituye las URLs de DealCar por las copias locales generadas con
 * `npm run inventory:images` cuando VEHICLE_IMAGES_SOURCE=local.
 */
async function localizeImages(vehicles: Vehicle[]): Promise<Vehicle[]> {
  if (process.env.VEHICLE_IMAGES_SOURCE !== "local") return vehicles;
  const manifest = (await readJson<Record<string, string>>(MANIFEST_FILE)) ?? {};
  return vehicles.map((v) => ({
    ...v,
    images: v.images.map((img) => ({ ...img, src: manifest[img.src] ?? img.src })),
  }));
}

async function load(): Promise<Vehicle[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const raw = await readJson<unknown>(DATA_FILE);
  if (raw === null) throw new Error(`No se encuentra ${DATA_FILE}`);
  const parsed = vehiclesFileSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 10)
      .map((i) => `  · [${i.path.join(".")}] ${i.message}`)
      .join("\n");
    throw new Error(`data/vehicles.json no es válido:\n${issues}`);
  }
  const data = await localizeImages(parsed.data);
  cache = { at: Date.now(), data };
  return data;
}

/** Fuente de verdad inicial: `data/vehicles.json`, editable por el cliente. */
export const jsonProvider: InventoryProvider = {
  name: "json",
  getAll: load,
  async getBySlug(brandSlug, slug) {
    return (await load()).find((v) => v.brandSlug === brandSlug && v.slug === slug) ?? null;
  },
  async getById(id) {
    return (await load()).find((v) => v.id === id) ?? null;
  },
};
