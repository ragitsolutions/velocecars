import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WithPending } from "@/components/ui/pending";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/lib/site";

/**
 * Contacto y redes. El mapa interactivo (Google Maps tras consentimiento) llega con la
 * página de contacto en la Fase 4; aquí se enlaza a Maps para no cargar terceros.
 */
export function ContactSection() {
  const items = [
    {
      icon: MapPin,
      label: "Dirección",
      value: `${site.address.street}, ${site.address.postalCode} ${site.address.city} (${site.address.region})`,
      href: site.address.mapsUrl,
      cta: "Cómo llegar",
      external: true,
    },
    {
      icon: Clock,
      label: "Horario",
      value: `${site.schedule.note} · ${site.schedule.hours}`,
    },
    {
      icon: Phone,
      label: "Teléfono y WhatsApp",
      value: site.contact.phone.display,
      href: `tel:${site.contact.phone.e164}`,
      cta: "Llamar",
    },
    {
      icon: Mail,
      label: "Email",
      value: site.contact.email,
      href: `mailto:${site.contact.email}`,
      cta: "Escribir",
    },
  ];

  return (
    <section aria-labelledby="contacto-title" className="section border-t border-line">
      <div className="container-luxe grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <SectionHeading
            index="06"
            eyebrow="Contacto"
            title={<span id="contacto-title">Ven a visitarnos</span>}
            intro={`En ${site.address.area}, Pozuelo de Alarcón. Síguenos en Instagram ${site.social.instagram.handle} para ver cada llegada al stock.`}
          />
          <div className="mt-10 flex flex-wrap gap-6 text-sm">
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

        <RevealGroup className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:col-span-7">
          {items.map(({ icon: Icon, label, value, href, cta, external }) => (
            <RevealItem key={label} className="flex flex-col gap-4 bg-bg p-8">
              <Icon className="size-5 text-accent" strokeWidth={1.25} aria-hidden />
              <p className="text-xs tracking-[0.18em] text-subtle uppercase">{label}</p>
              <p className="text-fg">
                <WithPending text={value} />
              </p>
              {href && (
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="link-underline mt-auto self-start text-sm text-muted hover:text-fg"
                >
                  {cta}
                </a>
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
