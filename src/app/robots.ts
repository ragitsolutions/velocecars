import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Fuera de producción (previews, staging) no se indexa nada (NEXT_PUBLIC_SITE_ENV=production). */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";
  if (!isProduction) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/guia-de-estilo",
          "/render/",
          "/vehiculos/comparar",
          "/inventario-filtrado",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
