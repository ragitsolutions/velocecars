import type { Metadata } from "next";
import { Clock, MessageCircle, Phone } from "lucide-react";
import { LazyValuationForm } from "@/components/forms/lazy";
import { FaqSection } from "@/components/home/faq-section";
import { ProcessSection } from "@/components/home/process-section";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { sellTeaser } from "@/content/home";
import { sellPage } from "@/content/pages";
import { getBrands } from "@/lib/inventory";
import { site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vende tu coche · Tasación gratuita en 24 h",
  description:
    "Tasamos tu coche gratis y sin compromiso en menos de 24 horas y gestionamos toda la venta: fotos, anuncios, compradores, contrato y transferencia. Veloce Cars, Pozuelo de Alarcón.",
  alternates: { canonical: "/vendemos-tu-coche" },
};

/** Marcas habituales para autocompletar (las del stock + otras premium frecuentes). */
const EXTRA_BRANDS = [
  "Alfa Romeo",
  "Bentley",
  "Cupra",
  "Lexus",
  "Lotus",
  "McLaren",
  "Mini",
  "Rolls-Royce",
  "Tesla",
  "Volvo",
];

export default async function SellPage() {
  const brands = [...new Set([...(await getBrands()).map((b) => b.name), ...EXTRA_BRANDS])].sort(
    (a, b) => a.localeCompare(b, "es"),
  );

  return (
    <>
      <PageHero
        eyebrow="Vendemos tu coche"
        title={sellPage.title}
        intro={sellPage.intro}
        image={{
          src: "/assets/original/deja-tu-coche.jpg",
          alt: "Coche en la exposición de Veloce Cars",
        }}
      >
        <ButtonLink href="#tasacion" variant="solid">
          Tasar mi coche
        </ButtonLink>
        <ButtonLink
          href={whatsappUrl("Hola Veloce Cars, quiero tasar mi coche.")}
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
        >
          Tasar por WhatsApp
        </ButtonLink>
      </PageHero>

      <section aria-labelledby="ventajas" className="section">
        <div className="container-luxe">
          <Reveal className="mb-16">
            <SectionHeading
              index="01"
              eyebrow="Por qué con nosotros"
              title={<span id="ventajas">{sellTeaser.title}</span>}
              intro={sellTeaser.text}
            />
          </Reveal>
          <RevealGroup className="grid gap-px border border-line bg-line md:grid-cols-3">
            {sellPage.arguments.map((a, i) => (
              <RevealItem key={a.title} className="flex flex-col gap-4 bg-bg p-8 lg:p-10">
                <span className="tabular font-display text-5xl text-accent/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl">{a.title}</h3>
                <p className="text-muted">{a.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal className="mt-14">
            <blockquote className="max-w-2xl border-l border-accent/60 pl-6 text-lg">
              «{sellTeaser.quote}»
            </blockquote>
          </Reveal>
        </div>
      </section>

      <ProcessSection index="02" ctaHref="#tasacion" />

      <section
        id="tasacion"
        aria-labelledby="tasacion-title"
        className="section scroll-mt-20 border-t border-line"
      >
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h-compact)+2rem)]">
              <SectionHeading
                index="03"
                eyebrow="Tasación online"
                title={<span id="tasacion-title">Tasa tu coche en 3 pasos</span>}
                intro="Gratuita y sin compromiso. Cuantos más datos y fotos, más precisa será la valoración."
              />
              <ul className="mt-10 flex flex-col gap-4 text-sm text-muted">
                <li className="flex items-center gap-3">
                  <Clock className="size-4 text-accent" strokeWidth={1.5} aria-hidden /> Respuesta
                  en menos de 24 horas
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-4 text-accent" strokeWidth={1.5} aria-hidden />
                  <a href={`tel:${site.contact.phone.e164}`} className="hover:text-fg">
                    ¿Prefieres hablar? {site.contact.phone.display}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="size-4 text-accent" strokeWidth={1.5} aria-hidden />
                  <a
                    href={whatsappUrl("Hola Veloce Cars, quiero tasar mi coche.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-fg"
                  >
                    Envíanos las fotos por WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border border-line bg-bg-secondary p-6 sm:p-10 lg:col-span-8">
            <LazyValuationForm brands={brands} />
          </div>
        </div>
      </section>

      <FaqSection faqs={sellPage.faqs} index="04" title="Dudas sobre la tasación" />
    </>
  );
}
