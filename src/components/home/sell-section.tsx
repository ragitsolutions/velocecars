import Image from "next/image";
import { Reveal, RevealImage, RevealText } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { sellTeaser } from "@/content/home";

export function SellSection() {
  return (
    <section aria-labelledby="vender-title" className="relative isolate overflow-hidden">
      <RevealImage className="absolute inset-0 -z-10">
        <Image
          src="/assets/original/deja-tu-coche.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[65%_center]"
        />
      </RevealImage>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/85 to-bg/20"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-transparent to-bg"
      />

      <div className="container-luxe section grid lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow mb-6 flex items-center gap-3">
              <span className="tabular">02</span>
              <span aria-hidden className="h-px w-8 bg-accent/60" />
              {sellTeaser.eyebrow}
            </p>
          </Reveal>
          <RevealText as="h2" id="vender-title" text={sellTeaser.title} className="text-5xl" />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-xl text-lg text-muted">{sellTeaser.text}</p>
          </Reveal>
          <Reveal delay={0.25}>
            <blockquote className="mt-10 max-w-lg border-l border-accent/60 pl-6 text-fg/90">
              <p className="text-lg">«{sellTeaser.quote}»</p>
            </blockquote>
          </Reveal>
          <Reveal delay={0.35} className="mt-12 flex flex-wrap gap-4">
            <ButtonLink href="/vendemos-tu-coche" size="lg" variant="solid">
              Tasa tu vehículo
            </ButtonLink>
            <ButtonLink href="/servicios" size="lg" variant="ghost">
              Cómo trabajamos
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
