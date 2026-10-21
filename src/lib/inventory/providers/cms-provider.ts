import "server-only";
import type { InventoryProvider, Vehicle } from "../types";

/**
 * Adaptador preparado para una fuente externa de inventario. Hoy no está conectado.
 *
 * Opciones previstas (ver docs/manual-cliente.md):
 *  1. CMS headless (Sanity o Payload): consultar la colección `vehicle` y devolver objetos
 *     con la forma de `Vehicle` (mismo esquema que data/vehicles.json).
 *  2. Feed de DealCar o de un portal (AutoScout24 / Coches.net) en XML/CSV/JSON: descargar
 *     el feed en `fetchAll()` y mapearlo como hace scripts/dealcar/import-stock.mjs.
 *
 * Activación: INVENTORY_PROVIDER=cms y las variables CMS_* de .env.example.
 * Los resultados se cachean con la revalidación ISR de las páginas (1 h), así que un cambio
 * en el CMS aparece en la web sin redesplegar.
 */
async function fetchAll(): Promise<Vehicle[]> {
  const endpoint = process.env.CMS_INVENTORY_URL;
  if (!endpoint) {
    throw new Error(
      "INVENTORY_PROVIDER=cms requiere CMS_INVENTORY_URL. Mientras tanto usa INVENTORY_PROVIDER=json.",
    );
  }
  const res = await fetch(endpoint, {
    headers: process.env.CMS_TOKEN ? { Authorization: `Bearer ${process.env.CMS_TOKEN}` } : {},
    next: { revalidate: 3600, tags: ["inventory"] },
  });
  if (!res.ok) throw new Error(`El CMS respondió ${res.status}`);
  // TODO(cms): mapear la respuesta real al tipo Vehicle y validarla con vehiclesFileSchema.
  return (await res.json()) as Vehicle[];
}

export const cmsProvider: InventoryProvider = {
  name: "cms",
  getAll: fetchAll,
  async getBySlug(brandSlug, slug) {
    return (await fetchAll()).find((v) => v.brandSlug === brandSlug && v.slug === slug) ?? null;
  },
  async getById(id) {
    return (await fetchAll()).find((v) => v.id === id) ?? null;
  },
};
