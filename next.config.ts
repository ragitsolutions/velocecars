import type { NextConfig } from "next";
import legacyVehicleRedirects from "./data/legacy-redirects.json" with { type: "json" };

/**
 * Redirecciones 301 desde la web anterior (DealCar). Ver docs/auditoria-web-actual.md §13.1.
 * `permanent: true` emite 308, que Google trata igual que 301; para las URLs heredadas se fuerza
 * el código 301 con `statusCode`.
 */
const BODY_CODES: Record<string, string> = {
  COUPE: "coupe",
  CABRIO: "cabrio",
  CUATRO_POR_CUATRO_SUV: "suv",
  BERLINA: "berlina",
  FAMILIAR: "familiar",
  MONOVOLUMEN: "monovolumen",
  FURGONETA: "furgoneta",
};

const legacyRedirects = [
  ...Object.entries(BODY_CODES).map(([code, slug]) => ({
    source: "/buy",
    has: [{ type: "query" as const, key: "bodyCodes", value: code }],
    destination: `/vehiculos?carroceria=${slug}`,
    statusCode: 301 as const,
  })),
  ...Object.entries(legacyVehicleRedirects as Record<string, string>).map(
    ([source, destination]) => ({ source, destination, statusCode: 301 as const }),
  ),
  { source: "/buy/:id", destination: "/vehiculos", statusCode: 301 as const },
  { source: "/buy", destination: "/vehiculos", statusCode: 301 as const },
  { source: "/sell", destination: "/vendemos-tu-coche", statusCode: 301 as const },
  { source: "/services", destination: "/servicios", statusCode: 301 as const },
  { source: "/contact", destination: "/contacto", statusCode: 301 as const },
  { source: "/financing", destination: "/financiacion", statusCode: 301 as const },
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Imagen Docker: servidor autónomo (.next/standalone). En Vercel y con `next start` no se usa.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  reactStrictMode: true,
  // El indicador de desarrollo se colaría en las capturas del hero (scripts/3d/render-turntable.mjs).
  devIndicators: false,
  poweredByHeader: false,
  // Metadatos siempre en <head> (sin «streaming metadata» en páginas dinámicas como /vehiculos
  // o /contacto): mejor para SEO y para cualquier rastreador, a costa de unos ms de TTFB.
  htmlLimitedBots: /.*/,
  images: {
    formats: ["image/avif", "image/webp"],
    // Pocos anchos: cada uno añade una URL larga al srcset de cada foto (y al payload RSC);
    // con 15 anchos el HTML del inventario llegaba a 250 KB.
    deviceSizes: [640, 828, 1080, 1600, 2048],
    imageSizes: [96, 256, 384],
    remotePatterns: [
      // Fotos de vehículos alojadas por DealCar (mientras no se sirvan las copias locales).
      // DealCar usa dos buckets: `vehicles-prd` y `vehicle-multipost-multimedia` (fotos sin extensión).
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/vehicles-prd/**" },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/vehicle-multipost-multimedia/**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // El JSON de inventario se lee con fs en tiempo de ejecución (ISR): debe viajar con las funciones.
  outputFileTracingIncludes: { "/**": ["./data/**/*.json"] },
  async redirects() {
    return legacyRedirects;
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
