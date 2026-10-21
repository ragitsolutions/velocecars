import { NextResponse } from "next/server";
import { vehicleHref } from "@/lib/inventory/urls";
import { getAllVehicles } from "@/lib/inventory";

export type VehicleSummary = {
  id: string;
  brand: string;
  model: string;
  version: string;
  price: number;
  year: number;
  mileageKm: number;
  image: string | null;
  href: string;
  status: string;
};

/**
 * Resumen público de vehículos por ID (favoritos y comparador, que viven en el navegador).
 *   GET /api/vehicles?ids=uuid1,uuid2
 */
export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(Boolean).slice(0, 50);
  if (!ids?.length) return NextResponse.json([]);
  const all = await getAllVehicles();
  const byId = new Map(all.map((v) => [v.id, v]));
  const items: VehicleSummary[] = ids
    .map((id) => byId.get(id))
    .filter((v) => v !== undefined)
    .map((v) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      version: v.version,
      price: v.price,
      year: v.year,
      mileageKm: v.mileageKm,
      image: v.images[0]?.src ?? null,
      href: vehicleHref(v),
      status: v.status,
    }));
  return NextResponse.json(items, { headers: { "Cache-Control": "public, max-age=300" } });
}
