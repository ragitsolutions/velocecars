import type { Vehicle } from "@/lib/inventory/types";
import { vehicleHref } from "@/lib/inventory/urls";
import { site } from "@/lib/site";

const FUEL: Record<Vehicle["fuel"], string> = {
  Gasolina: "Gasoline",
  Diésel: "Diesel",
  Híbrido: "Hybrid",
  "Híbrido enchufable": "PlugInHybrid",
  Eléctrico: "Electric",
};

const AVAILABILITY: Record<Vehicle["status"], string> = {
  disponible: "https://schema.org/InStock",
  reservado: "https://schema.org/LimitedAvailability",
  vendido: "https://schema.org/SoldOut",
};

/** schema.org/Car + Offer para la ficha (resultados enriquecidos de vehículos). */
export function vehicleSchema(v: Vehicle) {
  const url = new URL(vehicleHref(v), site.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${v.brand} ${v.model} ${v.version}`.trim(),
    url,
    image: v.images.slice(0, 6).map((i) => new URL(i.src, site.url).toString()),
    description: v.description || undefined,
    brand: { "@type": "Brand", name: v.brand },
    model: v.model,
    vehicleConfiguration: v.version || undefined,
    vehicleModelDate: String(v.year),
    dateVehicleFirstRegistered: v.registrationDate,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileageKm, unitCode: "KMT" },
    fuelType: FUEL[v.fuel],
    vehicleTransmission:
      v.transmission === "Automático" ? "AutomaticTransmission" : "ManualTransmission",
    bodyType: v.bodyType,
    color: v.color,
    numberOfDoors: v.doors,
    seatingCapacity: v.seats,
    driveWheelConfiguration: v.drivetrain,
    vehicleEngine: v.powerCv
      ? {
          "@type": "EngineSpecification",
          name: v.engine,
          enginePower: { "@type": "QuantitativeValue", value: v.powerCv, unitCode: "BHP" },
        }
      : undefined,
    itemCondition:
      v.condition === "Nuevo"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "EUR",
      availability: AVAILABILITY[v.status],
      url,
      seller: {
        "@type": "AutoDealer",
        "@id": `${site.url}/#organizacion`,
        name: site.name,
        url: site.url,
      },
    },
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: new URL(it.href, site.url).toString(),
    })),
  };
}
