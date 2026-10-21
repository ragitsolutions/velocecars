import Link from "@/components/ui/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { BrandSummary } from "@/lib/inventory/types";
import { legalNav, mainNav, site } from "@/lib/site";
import { Logo } from "@/components/ui/logo";
import { WithPending } from "@/components/ui/pending";
import { CursorToggle } from "@/components/motion/cursor-toggle";
import { CookieSettingsLink } from "./cookie-settings-link";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
    </svg>
  );
}

export function Footer({ brands }: { brands: BrandSummary[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-bg-secondary [contain-intrinsic-height:auto_30rem] [content-visibility:auto]">
      <div className="container-luxe grid gap-14 py-20 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Logo className="w-48" />
          <p className="max-w-sm text-sm text-muted">
            Compraventa y gestión de venta de vehículos premium en Pozuelo de Alarcón. Cada coche,
            revisado, documentado y presentado como merece.
          </p>
          <div className="flex gap-3">
            <a
              href={site.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${site.social.instagram.handle} (se abre en una pestaña nueva)`}
              className="grid size-11 place-items-center border border-line text-muted transition-colors hover:border-accent hover:text-fg"
            >
              <InstagramIcon className="size-5" aria-hidden />
            </a>
            <a
              href={site.social.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`TikTok ${site.social.tiktok.handle} (se abre en una pestaña nueva)`}
              className="grid size-11 place-items-center border border-line text-muted transition-colors hover:border-accent hover:text-fg"
            >
              <TikTokIcon className="size-5" aria-hidden />
            </a>
          </div>
        </div>

        <nav aria-label="Mapa del sitio" className="lg:col-span-2">
          <h2 className="eyebrow mb-5">Veloce Cars</h2>
          <ul className="space-y-3 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline text-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Marcas" className="lg:col-span-3">
          <h2 className="eyebrow mb-5">Marcas en stock</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {brands.slice(0, 12).map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/vehiculos/${b.slug}`}
                  className="link-underline text-muted hover:text-fg"
                >
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="flex flex-col gap-4 text-sm text-muted not-italic lg:col-span-3">
          <h2 className="eyebrow mb-1">Visítanos</h2>
          <a
            href={site.address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 hover:text-fg"
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
            <span>
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city} ({site.address.region})
            </span>
          </a>
          <a href={`tel:${site.contact.phone.e164}`} className="flex gap-3 hover:text-fg">
            <Phone className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
            <span className="tabular">{site.contact.phone.display}</span>
          </a>
          <a href={`mailto:${site.contact.email}`} className="flex gap-3 hover:text-fg">
            <Mail className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
            <span>{site.contact.email}</span>
          </a>
          <p className="border-l border-accent/50 pl-3 text-fg">
            {site.schedule.note}
            <br />
            <span className="text-muted">
              <WithPending text={site.schedule.hours} />
            </span>
          </p>
        </address>
      </div>

      <div className="border-t border-line">
        <div className="container-luxe flex flex-col gap-4 py-6 pb-24 text-xs text-subtle sm:pb-6 lg:flex-row lg:items-center lg:justify-between lg:pr-24">
          <div className="space-y-1">
            <p>
              © {year} {site.company.legalName} · CIF {site.company.taxId} ·{" "}
              <WithPending text={site.company.registry} />
            </p>
            {/* Atribución exigida por la licencia CC BY 4.0 del modelo 3D del hero */}
            <p className="text-[0.6875rem]">
              Modelo 3D de portada:{" "}
              <a
                href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-fg"
              >
                «Car Concept»
              </a>{" "}
              de Eric Chadwick (© Darmstadt Graphics Group), licencia{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/deed.es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-fg"
              >
                CC BY 4.0
              </a>
              , modificado.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsLink />
            </li>
            <li>
              <CursorToggle />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
