import type { Metadata } from "next";
import {
  GeneralInventoryPage,
  inventoryMetadata,
  type InventorySearchParams,
} from "@/components/inventory/inventory-pages";

/**
 * Versión dinámica de /vehiculos para URLs con filtros (se llega por reescritura del
 * middleware; la URL visible sigue siendo /vehiculos?…). Canónico: /vehiculos o la marca.
 */
type SearchParams = Promise<InventorySearchParams>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  return inventoryMetadata(await searchParams);
}

export default async function FilteredInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return <GeneralInventoryPage sp={await searchParams} />;
}
