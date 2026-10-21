import { Plus } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs as homeFaqs } from "@/content/home";
import type { Faq } from "@/content/pages";
import { JsonLd, faqPageSchema } from "@/lib/seo/json-ld";

/**
 * Preguntas frecuentes (por defecto, las de la home). Acordeón nativo (<details>): accesible
 * sin JavaScript. Emite el JSON-LD FAQPage de la página.
 */
export function FaqSection({
  faqs = homeFaqs,
  index = "05",
  title = "Resolvemos tus dudas",
}: {
  faqs?: Faq[];
  index?: string;
  title?: string;
}) {
  return (
    <section aria-labelledby="faq-title" className="section border-t border-line">
      <JsonLd data={faqPageSchema(faqs)} />
      <div className="container-luxe grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <SectionHeading
            index={index}
            eyebrow="Preguntas frecuentes"
            title={<span id="faq-title">{title}</span>}
            intro="¿No encuentras la respuesta? Escríbenos por WhatsApp o reserva una cita."
          />
        </Reveal>
        <RevealGroup as="div" className="border-t border-line lg:col-span-8">
          {faqs.map((f) => (
            <RevealItem as="div" key={f.question} className="border-b border-line">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg text-fg transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <Plus
                    aria-hidden
                    strokeWidth={1.25}
                    className="size-5 shrink-0 text-accent transition-transform duration-500 ease-luxe group-open:rotate-45"
                  />
                </summary>
                <p className="max-w-3xl pb-8 text-muted">{f.answer}</p>
              </details>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
