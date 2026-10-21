import type { Metadata } from "next";
import {
  BrandInventoryPage,
  brandMetadata,
  type InventorySearchParams,
} from "@/components/inventory/inventory-pages";

/** Versión dinámica de /vehiculos/[marca] para URLs con filtros (ver src/middleware.ts). */
type Params = Promise<{ marca: string }>;
type SearchParams = Promise<InventorySearchParams>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return brandMetadata((await params).marca);
}

export default async function FilteredBrandPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return <BrandInventoryPage slug={(await params).marca} sp={await searchParams} />;
}
