import type { Metadata } from "next";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { LazyAppointmentForm, LazyContactForm } from "@/components/forms/lazy";
import { FaqSection } from "@/components/home/faq-section";
import { ConsentMap } from "@/components/layout/consent-map";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { WithPending } from "@/components/ui/pending";
import { SectionHeading } from "@/components/ui/section-heading";
import { contactFaqs } from "@/content/pages";
import { getAllVehicles } from "@/lib/inventory";
import { site, whatsappUrl } from "@/lib/site";
import { APPOINTMENT_REASONS } from "@/lib/validation/appointment";

export const metadata: Metadata = {
  title: "Contacto y cita previa",
  description:
    "Reserva tu cita en Veloce Cars: Avenida de Luis García Cereceda 5, Pozuelo de Alarcón (Madrid). Teléfono, WhatsApp, email y formulario de contacto.",
  alternates: { canonical: "/contacto" },
};

type SearchParams = Promise<{ vehiculo?: string; motivo?: string }>;

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const { vehiculo, motivo } = await searchParams;
  const vehicles = (await getAllVehicles())
    .filter((v) => v.status !== "vendido")
    .sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "es"))
    .map((v) => ({
      id: v.id,
      name: `${v.brand} ${v.model} ${v.version} · ${v.year}`.replace(/\s+/g, " "),
    }));
  const reason =
    motivo && motivo in APPOINTMENT_REASONS
      ? (motivo as keyof typeof APPOINTMENT_REASONS)
      : undefined;

  const channels = [
    {
      icon: Phone,
      label: "Llámanos",
      value: site.contact.phone.display,
      href: `tel:${site.contact.phone.e164}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: site.contact.phone.display,
      href: whatsappUrl(),
      external: true,
    },
    {
      icon: Mail,
      label: "Escríbenos",
      value: site.contact.email,
      href: `mailto:${site.contact.email}`,
    },
    {
      icon: MapPin,
      label: "Visítanos",
      value: `${site.address.street}, ${site.address.postalCode} ${site.address.city}`,
      href: site.address.mapsUrl,
      external: true,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Te atendemos con cita previa"
        intro="Para información sobre nosotros o cualquier vehículo, no dudes en contactarnos."
        image={{
          src: "/assets/original/contacto-hero.jpg",
          alt: "BMW M4 amarillo en el estudio de Veloce Cars",
        }}
      >
        <ButtonLink href="#cita" variant="solid">
          Reservar cita
        </ButtonLink>
        <ButtonLink href={whatsappUrl()} target="_blank" rel="noopener noreferrer" variant="ghost">
          WhatsApp
        </ButtonLink>
      </PageHero>

      <section aria-label="Canales de contacto" className="container-luxe pb-[var(--section-y)]">
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {channels.map(({ icon: Icon, label, value, href, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex h-full flex-col gap-4 bg-bg p-8 transition-colors hover:bg-bg-secondary"
              >
                <Icon className="size-5 text-accent" strokeWidth={1.25} aria-hidden />
                <span className="text-xs tracking-[0.18em] text-subtle uppercase">{label}</span>
                <span className="flex items-start justify-between gap-3 text-fg">
                  {value}
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="cita"
        aria-labelledby="cita-title"
        className="section scroll-mt-20 border-t border-line"
      >
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              index="01"
              eyebrow="Cita previa"
              title={<span id="cita-title">Reserva tu visita</span>}
              intro="Elige el motivo, el día y la franja que mejor te encaje. Te confirmamos la hora exacta por teléfono o WhatsApp."
            />
            <p className="mt-8 flex items-center gap-3 text-sm text-muted">
              <Clock className="size-4 text-accent" strokeWidth={1.5} aria-hidden />
              <span>
                {site.schedule.note} · <WithPending text={site.schedule.hours} />
              </span>
            </p>
          </Reveal>
          <div className="border border-line bg-bg-secondary p-6 sm:p-10 lg:col-span-8">
            <LazyAppointmentForm
              vehicles={vehicles}
              defaultVehicleId={vehiculo}
              defaultReason={reason}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="ubicacion-title" className="section border-t border-line">
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              index="02"
              eyebrow="Ubicación"
              title={<span id="ubicacion-title">Nuestra ubicación</span>}
              intro={`${site.address.street}, ${site.address.postalCode} ${site.address.city} (${site.address.region}), en ${site.address.area}.`}
            />
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              {[site.social.instagram, site.social.tiktok].map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-1 text-muted hover:text-fg"
                >
                  {s.url.includes("instagram") ? "Instagram" : "TikTok"} {s.handle}
                  <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden />
                </a>
              ))}
            </div>
          </Reveal>
          <div className="lg:col-span-8">
            <ConsentMap />
          </div>
        </div>
      </section>

      <section aria-labelledby="mensaje-title" className="section border-t border-line">
        <div className="container-luxe grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              index="03"
              eyebrow="Escríbenos"
              title={<span id="mensaje-title">¿Tienes alguna pregunta?</span>}
              intro="Cuéntanos qué buscas o qué necesitas y te respondemos lo antes posible."
            />
          </Reveal>
          <div className="lg:col-span-8">
            <LazyContactForm />
          </div>
        </div>
      </section>

      <FaqSection faqs={contactFaqs} index="04" />
    </>
  );
}
