import Image from "next/image";
import {
  Reveal,
  RevealGroup,
  RevealImage,
  RevealItem,
  RevealText,
} from "@/components/motion/reveal";
import { valueProposition } from "@/content/home";
import { fitHeading } from "@/lib/utils/fit-heading";

/** Propuesta de valor: la «asesoría automovilística» de la web actual, con foto de su estudio. */
export function ValueSection() {
  const { eyebrow, title, intro, pillars } = valueProposition;
  return (
    <section aria-labelledby="valor-title" className="section border-t border-line">
      <div className="container-luxe grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <RevealImage className="relative aspect-[4/3] lg:col-span-7 lg:aspect-[16/11]">
          <Image
            src="/assets/original/propuesta-asesoria.jpg"
            alt="Porsche 911 azul en el estudio de Veloce Cars, con la matrícula VELOCECARS"
            fill
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="object-cover"
          />
        </RevealImage>

        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow mb-6 flex items-center gap-3">
              <span className="tabular">03</span>
              <span aria-hidden className="h-px w-8 bg-accent/60" />
              {eyebrow}
            </p>
          </Reveal>
          <RevealText as="h2" id="valor-title" text={title} className="text-4xl" />
          <Reveal delay={0.15}>
            <p className="mt-6 text-lg text-muted">{intro}</p>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-px bg-line sm:grid-cols-2">
            {pillars.map((p) => (
              <RevealItem key={p.title} className="@container bg-bg p-6">
                <h3 className="fit mb-2 [--size:var(--text-base)]" style={fitHeading(p.title)}>
                  {p.title}
                </h3>
                <p className="text-sm text-muted">{p.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
