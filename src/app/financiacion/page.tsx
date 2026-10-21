import type { Metadata } from "next";
import { Check, FileText } from "lucide-react";
import { LazyContactForm, LazyFinancingSimulator } from "@/components/forms/lazy";
import { FaqSection } from "@/components/home/faq-section";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { WithPending } from "@/components/ui/pending";
import { SectionHeading } from "@/components/ui/section-heading";
import { financingPage } from "@/content/pages";
import { financing } from "@/lib/financing";
import { getInventoryStats } from "@/lib/inventory";

export const metadata: Metadata = {
  title: "Financiación · Calcula tu cuota",
  description:
    "Financia tu coche de 12 a 84 meses, con o sin entrada. Calcula tu cuota orientativa y solicita el estudio de tu financiación en Veloce Cars.",
  alternates: { canonical: "/financiacion" },
};

export default async function FinancingPage() {
  const stats = await getInventoryStats();
  const max = Math.max(150_000, Math.ceil(stats.priceMax / 10_000) * 10_000);

  return (
    <>
      <PageHero
        eyebrow="Financiación"
        title={financingPage.title}
        intro={financingPage.intro}
        image={{
          src: "/assets/original/propuesta-asesoria.jpg",
          alt: "Porsche 911 en el estudio de Veloce Cars",
        }}
      >
        <ButtonLink href="#calculadora" variant="solid">
          Calcular mi cuota
        </ButtonLink>
        <ButtonLink href="#solicitud" variant="ghost">
          Solicitar estudio
        </ButtonLink>
      </PageHero>

      <section
        id="calculadora"
        aria-labelledby="calculadora-title"
        className="section scroll-mt-20"
      >
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              index="01"
              eyebrow="Calculadora"
              title={<span id="calculadora-title">Calcula tu cuota</span>}
              intro={`Plazos de ${financing.minMonths} a ${financing.maxMonths} meses. Puedes financiar el 100 % o aportar una entrada.`}
            />
            <p className="mt-8 text-xs leading-relaxed text-subtle">
              <WithPending text={financingPage.entityNote} />
            </p>
          </Reveal>
          <div className="lg:col-span-8">
            <LazyFinancingSimulator initialPrice={60_000} max={max} />
          </div>
        </div>
      </section>

      <section aria-labelledby="modalidades-title" className="section border-t border-line">
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              index="02"
              eyebrow="Cómo funciona"
              title={<span id="modalidades-title">A tu manera</span>}
              intro="Para particulares, colectivos, autónomos y empresas."
            />
          </Reveal>
          <div className="flex flex-col gap-10 lg:col-span-8">
            <RevealGroup className="grid gap-px border border-line bg-line sm:grid-cols-2">
              {financingPage.modes.map((m) => (
                <RevealItem key={m.title} className="flex flex-col gap-3 bg-bg p-8">
                  <h3 className="text-xl">{m.title}</h3>
                  <p className="text-sm text-muted">{m.text}</p>
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal>
              <h3 className="mb-5 flex items-center gap-3 text-xl">
                <FileText className="size-5 text-accent" strokeWidth={1.25} aria-hidden />{" "}
                Documentación habitual
              </h3>
              <ul className="grid gap-3 text-muted sm:grid-cols-2">
                {financingPage.documents.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-accent"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    {d}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="solicitud"
        aria-labelledby="solicitud-title"
        className="section scroll-mt-20 border-t border-line"
      >
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              index="03"
              eyebrow="Preaprobación"
              title={<span id="solicitud-title">Pide tu estudio</span>}
              intro="Sin compromiso. Te contactamos con las condiciones y la documentación necesaria."
            />
          </Reveal>
          <div className="border border-line bg-bg-secondary p-6 sm:p-10 lg:col-span-8">
            <LazyContactForm
              topic="financiacion"
              defaultMessage="Hola, me gustaría estudiar la financiación de un vehículo. Importe aproximado: … · Plazo: … meses · Situación laboral: …"
              submitLabel="Solicitar estudio"
            />
          </div>
        </div>
      </section>

      <FaqSection faqs={financingPage.faqs} index="04" />
    </>
  );
}
