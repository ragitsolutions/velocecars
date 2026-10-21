"use client";

import { useEffect, useState } from "react";
import type { VehicleSummary } from "@/app/api/vehicles/route";

/** Carga el resumen de los vehículos indicados (orden preservado). */
export function useVehicleSummaries(ids: string[]) {
  const [items, setItems] = useState<VehicleSummary[]>([]);
  const key = ids.join(",");
  useEffect(() => {
    if (!key) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/vehicles?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => {});
    return () => controller.abort();
  }, [key]);
  return items;
}
