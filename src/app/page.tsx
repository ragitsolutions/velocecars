import { Suspense } from "react";
import { AppointmentCta } from "@/components/home/appointment-cta";
import { ContactSection } from "@/components/home/contact-section";
import { FaqSection } from "@/components/home/faq-section";
import { Hero } from "@/components/home/hero/hero";
import { SellSection } from "@/components/home/sell-section";
import { ServicesSection } from "@/components/home/services-section";
import { StockSection } from "@/components/home/stock-section";
import { ValueSection } from "@/components/home/value-section";
import {
  getBodyTypeCounts,
  getBrands,
  getFeaturedVehicles,
  getInventoryStats,
} from "@/lib/inventory";

export const revalidate = 3600;

/**
 * Home centrada en el inventario y en la venta, con la misma estructura que la web actual:
 * buscador → en venta → vende tu coche → asesoría → servicios → preguntas → contacto.
 */
export default async function HomePage() {
  const [featured, stats, brands, bodies] = await Promise.all([
    getFeaturedVehicles(9),
    getInventoryStats(),
    getBrands(),
    getBodyTypeCounts(),
  ]);

  // Cada <Suspense> se hidrata como una unidad aparte y React cede el hilo entre ellas: sin
  // ellos la hidratación de la portada era una sola tarea larga (TBT en Lighthouse).
  return (
    <>
      <Suspense>
        <Hero total={stats.count} bodies={bodies} />
      </Suspense>
      <Suspense>
        <StockSection vehicles={featured} brands={brands} total={stats.count} />
      </Suspense>
      <Suspense>
        <SellSection />
        <ValueSection />
      </Suspense>
      <Suspense>
        <ServicesSection />
        <FaqSection />
      </Suspense>
      <Suspense>
        <AppointmentCta />
        <ContactSection />
      </Suspense>
    </>
  );
}
