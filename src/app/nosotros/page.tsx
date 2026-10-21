import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, RevealGroup, RevealImage, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { WithPending } from "@/components/ui/pending";
import { SectionHeading } from "@/components/ui/section-heading";
import { aboutPage } from "@/content/pages";
import { getInventoryStats } from "@/lib/inventory";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Veloce Cars, asesoría automovilística en Pozuelo de Alarcón (Madrid): compraventa y gestión de venta de vehículos premium con trato exclusivo y personalizado.",
  alternates: { canonical: "/nosotros" },
};

export default async function AboutPage() {
  const stats = await getInventoryStats();
  const figures: { value: number; suffix?: string; label: string }[] = [
    { value: stats.count, label: "Vehículos en stock" },
    { value: stats.brands, label: "Marcas disponibles" },
    { value: 24, suffix: " h", label: "Para tasar tu coche" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Nosotros"
        title={aboutPage.title}
        intro={aboutPage.intro}
        image={{
          src: "/assets/original/propuesta-asesoria.jpg",
          alt: "Porsche 911 azul en el estudio de Veloce Cars",
        }}
      >
        <ButtonLink href="/vehiculos" variant="solid">
          Ver vehículos
        </ButtonLink>
        <ButtonLink href="/contacto#cita" variant="ghost">
          Visítanos
        </ButtonLink>
      </PageHero>

      <section aria-labelledby="historia" className="section">
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              index="01"
              eyebrow="Quiénes somos"
              title={<span id="historia">{site.claim}</span>}
            />
          </Reveal>
          <Reveal delay={0.1} className="space-y-6 text-lg text-muted lg:col-span-7">
            {aboutPage.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="text-sm">
              <WithPending text={aboutPage.history} />
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-label="Cifras" className="border-y border-line">
        <div className="container-luxe grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {figures.map((f) => (
            <div key={f.label} className="flex flex-col gap-2 py-12 sm:px-8 sm:first:pl-0">
              <span className="tabular font-display text-6xl">
                <CountUp value={f.value} suffix={f.suffix} />
              </span>
              <span className="text-xs tracking-[0.18em] text-subtle uppercase">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="valores" className="section">
        <div className="container-luxe">
          <Reveal className="mb-16">
            <SectionHeading
              index="02"
              eyebrow="Cómo trabajamos"
              title={<span id="valores">Lo que nos define</span>}
            />
          </Reveal>
          <RevealGroup className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {aboutPage.values.map((v) => (
              <RevealItem key={v.title} className="flex flex-col gap-3 bg-bg p-8">
                <h3 className="text-xl">{v.title}</h3>
                <p className="text-sm text-muted">{v.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section aria-labelledby="instalaciones" className="section border-t border-line">
        <div className="container-luxe">
          <Reveal className="mb-16">
            <SectionHeading
              index="03"
              eyebrow="Instalaciones"
              title={<span id="instalaciones">Nuestra exposición</span>}
              intro={`En ${site.address.area}, ${site.address.city}. ${site.schedule.note}: te dedicamos todo el tiempo que necesites.`}
            />
          </Reveal>
          <div className="grid gap-3 md:grid-cols-3">
            <RevealImage className="relative aspect-[4/3] overflow-hidden md:col-span-2 md:aspect-auto md:min-h-[28rem]">
              <Image
                src="/assets/original/servicios-fondo.jpg"
                alt="Exposición de Veloce Cars"
                fill
                sizes="(min-width: 768px) 64vw, 100vw"
                className="object-cover"
              />
            </RevealImage>
            <RevealImage className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/assets/original/deja-tu-coche.jpg"
                alt="Coche preparado en el estudio de Veloce Cars"
                fill
                sizes="(min-width: 768px) 32vw, 100vw"
                className="object-cover"
              />
            </RevealImage>
          </div>
        </div>
      </section>

      <section aria-labelledby="equipo" className="section border-t border-line">
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              index="04"
              eyebrow="Equipo"
              title={<span id="equipo">Las personas detrás de cada venta</span>}
            />
          </Reveal>
          <Reveal delay={0.1} className="text-muted lg:col-span-7">
            <WithPending text={aboutPage.team} />
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/contacto#cita" variant="solid">
                Reservar cita
              </ButtonLink>
              <ButtonLink href="/vendemos-tu-coche" variant="ghost">
                Vender mi coche
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
