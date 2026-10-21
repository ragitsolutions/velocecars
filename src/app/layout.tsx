import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { ConsentProvider } from "@/components/layout/consent-provider";
import { DeferredExtras } from "@/components/layout/deferred-extras";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { CONSENT_BOOT_SCRIPT } from "@/lib/consent";
import { REVEAL_SCRIPT } from "@/lib/reveal-script";
import { getBrands, getInventoryStats } from "@/lib/inventory";
import { JsonLd } from "@/lib/seo/json-ld";
import { autoDealerSchema } from "@/lib/seo/organization-schema";
import { site } from "@/lib/site";
import { display, sans } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Veloce Cars · Vehículos premium y de lujo en Madrid",
    template: "%s | Veloce Cars Madrid",
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: site.name,
    url: "/",
    images: [{ url: "/assets/original/propuesta-asesoria.jpg", width: 2000, height: 1153 }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [brands, stats] = await Promise.all([getBrands(), getInventoryStats()]);
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_BOOT_SCRIPT }} />
      </head>
      <body>
        <a
          href="#contenido"
          className="fixed top-3 left-3 z-[100] -translate-y-20 bg-accent px-4 py-2 text-sm font-semibold text-inverse focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <ConsentProvider>
          {/* Límites de Suspense: cabecera y pie se hidratan por separado (tareas más cortas).
              El contenido no: en páginas dinámicas (/vehiculos, /contacto) un límite aquí hacía
              que React enviara primero el armazón vacío y el contenido después, retrasando el
              primer pintado con contenido hasta la hidratación. */}
          <Suspense>
            <Header brands={brands} total={stats.count} />
          </Suspense>
          <main id="contenido" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Suspense>
            <Footer brands={brands} />
          </Suspense>
          <WhatsAppButton />
          <DeferredExtras />
        </ConsentProvider>
        <JsonLd data={autoDealerSchema()} />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
      </body>
    </html>
  );
}
