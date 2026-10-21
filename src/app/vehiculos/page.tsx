import { GeneralInventoryPage, inventoryMetadata } from "@/components/inventory/inventory-pages";

// Estática (ISR): sin filtros. Las URLs con filtros las sirve /inventario-filtrado (middleware).
export const dynamic = "force-static";
export const revalidate = 3600;

export const generateMetadata = () => inventoryMetadata();

export default function InventoryPage() {
  return <GeneralInventoryPage />;
}
