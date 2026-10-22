import type { Metadata } from "next";
import Image from "next/image";
import { FaqSection } from "@/components/home/faq-section";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, RevealGroup, RevealItem, RevealImage } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { servicesPage } from "@/content/pages";
import { getFeaturedVehicles } from "@/lib/inventory";

export const metadata: Metadata = {
  title: "Servicios · Gestión de venta, garantía, financiación y renting",
  description:
    "Gestión integral de la venta de tu coche, tasación gratuita, revisión, reportaje audiovisual, estudio de mercado, trámites, garantía, financiación, renting y asesoría automovilística en Pozuelo de Alarcón.",
  alternates: { canonical: "/servicios" },
};

export default async function ServicesPage() {
  const featured = await getFeaturedVehicles(3);
  return (
    <>
      <PageHero
        eyebrow="Servicios"
        title={servicesPage.title}
        intro={servicesPage.intro}
        image={{
          src: "/assets/original/servicios-fondo.jpg",
          alt: "Interior de la exposición de Veloce Cars",
        }}
      >
        <ButtonLink href="/vendemos-tu-coche" variant="solid">
          Tasar mi coche
        </ButtonLink>
        <ButtonLink href="/contacto#cita" variant="ghost">
          Reservar cita
        </ButtonLink>
      </PageHero>

      {servicesPage.groups.map((group, gi) => (
        <section
          key={group.title}
          aria-labelledby={`servicios-${gi}`}
          className="section border-t border-line first-of-type:border-t-0"
        >
          <div className="container-luxe grid gap-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <SectionHeading
                index={String(gi + 1).padStart(2, "0")}
                eyebrow="Servicios"
                title={<span id={`servicios-${gi}`}>{group.title}</span>}
              />
            </Reveal>
            <RevealGroup
              as="ul"
              className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:col-span-8"
            >
              {group.items.map((item, i) => (
                <RevealItem
                  as="li"
                  key={item.title}
                  className="group flex flex-col gap-3 bg-bg p-8 transition-colors duration-500 hover:bg-bg-secondary last:odd:sm:col-span-2"
                >
                  <span className="tabular text-xs tracking-[0.2em] text-subtle group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl">{item.title}</h3>
                  <p className="text-sm text-muted">{item.text}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ))}

      <section aria-labelledby="vender-banner" className="relative isolate overflow-hidden">
        <RevealImage className="absolute inset-0 -z-10">
          <Image
            src="/assets/original/servicios-quieres-vender.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </RevealImage>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/80 to-bg/30"
        />
        <div className="container-luxe section">
          <Reveal className="max-w-xl">
            <p className="eyebrow mb-6">Vendemos tu coche</p>
            <h2 id="vender-banner" className="text-5xl">
              ¿Quieres vender tu coche?
            </h2>
            <p className="mt-6 text-lg text-muted">
              Tasación gratuita en menos de 24 horas y gestión completa de la venta.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/vendemos-tu-coche#tasacion" variant="solid" size="lg">
                Tasar mi coche
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="en-venta" className="section">
          <div className="container-luxe">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                className="min-w-0 flex-1"
                eyebrow="En venta"
                title={<span id="en-venta">Vehículos en venta</span>}
              />
              <ButtonLink href="/vehiculos">Ver todo el stock</ButtonLink>
            </div>
            <ul className="grid gap-6 md:grid-cols-3">
              {featured.map((v) => (
                <li key={v.id}>
                  <VehicleCard vehicle={v} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <FaqSection
        faqs={servicesPage.faqs}
        index={String(servicesPage.groups.length + 1).padStart(2, "0")}
      />
    </>
  );
}
