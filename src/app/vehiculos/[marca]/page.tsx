import { BrandInventoryPage, brandMetadata } from "@/components/inventory/inventory-pages";
import { getBrands } from "@/lib/inventory";

type Params = Promise<{ marca: string }>;

// Estática (ISR) por marca, sin filtros. Con filtros: /inventario-filtrado/[marca] (middleware).
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getBrands()).map((b) => ({ marca: b.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  return brandMetadata((await params).marca);
}

export default async function BrandPage({ params }: { params: Params }) {
  return <BrandInventoryPage slug={(await params).marca} />;
}
