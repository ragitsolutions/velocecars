import type { MetadataRoute } from "next";
import { getAllVehicles, getBrands } from "@/lib/inventory";
import { vehicleHref } from "@/lib/inventory/urls";
import { site } from "@/lib/site";

export const revalidate = 3600;

const STATIC_PAGES: [
  path: string,
  priority: number,
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly",
][] = [
  ["/", 1, "daily"],
  ["/vehiculos", 0.9, "daily"],
  ["/vendemos-tu-coche", 0.8, "monthly"],
  ["/financiacion", 0.6, "monthly"],
  ["/servicios", 0.6, "monthly"],
  ["/nosotros", 0.5, "yearly"],
  ["/contacto", 0.7, "yearly"],
  ["/aviso-legal", 0.1, "yearly"],
  ["/politica-privacidad", 0.1, "yearly"],
  ["/politica-cookies", 0.1, "yearly"],
  ["/condiciones-de-uso", 0.1, "yearly"],
];

/** sitemap.xml: páginas, landings por marca y fichas (las vendidas no se listan: son noindex). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, brands] = await Promise.all([getAllVehicles(), getBrands()]);
  const url = (path: string) => new URL(path, site.url).toString();
  const latest = vehicles.reduce((max, v) => (v.updatedAt > max ? v.updatedAt : max), "");

  return [
    ...STATIC_PAGES.map(([path, priority, changeFrequency]) => ({
      url: url(path),
      priority,
      changeFrequency,
      lastModified: path === "/" || path === "/vehiculos" ? latest || undefined : undefined,
    })),
    ...brands.map((b) => ({
      url: url(`/vehiculos/${b.slug}`),
      priority: 0.7,
      changeFrequency: "daily" as const,
    })),
    ...vehicles
      .filter((v) => v.status !== "vendido")
      .map((v) => ({
        url: url(vehicleHref(v)),
        lastModified: v.updatedAt,
        priority: 0.8,
        changeFrequency: "weekly" as const,
        images: v.images.slice(0, 1).map((i) => new URL(i.src, site.url).toString()),
      })),
  ];
}
