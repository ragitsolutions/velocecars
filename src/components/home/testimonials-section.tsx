import testimonialsData from "@data/testimonials.json";
import { Reveal } from "@/components/motion/reveal";
import { Pending } from "@/components/ui/pending";
import { SectionHeading } from "@/components/ui/section-heading";
import { TestimonialsSlider, type Testimonial } from "./testimonials-slider";

/**
 * Opiniones de clientes. Se alimenta de data/testimonials.json (vacío hasta que el cliente
 * aporte reseñas reales con permiso de publicación: pendiente D1). Las reseñas que mostraba
 * la web anterior eran de DealCar y no se reutilizan.
 */
export function TestimonialsSection() {
  const testimonials = testimonialsData as Testimonial[];
  return (
    <section aria-labelledby="opiniones-title" className="section">
      <div className="container-luxe">
        <Reveal className="mb-14">
          <SectionHeading
            index="07"
            eyebrow="Opiniones"
            title={<span id="opiniones-title">Lo que dicen nuestros clientes</span>}
          />
        </Reveal>
        {testimonials.length > 0 ? (
          <TestimonialsSlider testimonials={testimonials} />
        ) : (
          <div className="border border-dashed border-line-strong p-10 text-muted">
            <Pending>testimonios reales de clientes (con permiso de publicación)</Pending>
            <p className="mt-4 max-w-2xl text-sm">
              Formato previsto en data/testimonials.json: nombre o iniciales, vehículo, texto,
              puntuación de 1 a 5 y fecha.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
