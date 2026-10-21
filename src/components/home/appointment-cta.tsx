import Image from "next/image";
import { Phone } from "lucide-react";
import { Reveal, RevealImage, RevealText } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { site, whatsappUrl } from "@/lib/site";

/** Llamada a la acción principal: Veloce vende con cita previa. */
export function AppointmentCta() {
  return (
    <section aria-labelledby="cita-title" className="relative isolate overflow-hidden">
      <RevealImage className="absolute inset-0 -z-10">
        <Image
          src="/assets/original/contacto-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </RevealImage>
      <div aria-hidden className="absolute inset-0 -z-10 bg-bg/75" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-transparent to-bg"
      />

      <div className="container-luxe section flex flex-col items-center text-center">
        <Reveal>
          <p className="eyebrow mb-6">{site.schedule.note}</p>
        </Reveal>
        <RevealText
          as="h2"
          id="cita-title"
          text="Tu cita privada en Veloce Cars"
          className="max-w-4xl text-5xl"
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Ven a ver el coche que te interesa o a tasar el tuyo, sin esperas y con toda nuestra
            atención.
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-12 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/contacto#cita" size="lg" variant="solid">
            Reservar cita
          </ButtonLink>
          <ButtonLink href={whatsappUrl()} size="lg" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </ButtonLink>
          <ButtonLink href={`tel:${site.contact.phone.e164}`} size="lg" variant="ghost">
            <Phone className="size-4" strokeWidth={1.5} aria-hidden />
            {site.contact.phone.display}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
