"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

export type Testimonial = {
  name: string;
  vehicle?: string;
  text: string;
  rating: number;
  date?: string;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Una opinión a la vez, con deslizamiento suave; avanza sola cada 8 s salvo con reduced-motion. */
export function TestimonialsSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [[index, dir], setState] = useState<[number, 1 | -1]>([0, 1]);
  const go = (d: 1 | -1) =>
    setState(([i]) => [(i + d + testimonials.length) % testimonials.length, d]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => go(1), 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go solo depende de la longitud
  }, [testimonials.length]);

  const t = testimonials[index]!;
  return (
    <div className="grid items-end gap-10 md:grid-cols-12" aria-roledescription="carrusel">
      <div className="relative min-h-[16rem] overflow-hidden md:col-span-9">
        <figure
          key={index}
          aria-live="polite"
          className={
            dir === 1
              ? "motion-safe:animate-[step-in_600ms_var(--ease-luxe)]"
              : "motion-safe:animate-[step-in-back_600ms_var(--ease-luxe)]"
          }
        >
          <div className="mb-6 flex gap-1" aria-label={`${t.rating} de 5 estrellas`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                aria-hidden
                strokeWidth={1}
                className={`size-4 ${i < t.rating ? "fill-accent text-accent" : "text-line-strong"}`}
              />
            ))}
          </div>
          <blockquote className="font-display text-3xl leading-tight normal-case">
            «{t.text}»
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-full border border-line-strong text-sm">
              {initials(t.name)}
            </span>
            <span>
              <span className="block text-fg">{t.name}</span>
              {t.vehicle && <span className="text-sm text-muted">{t.vehicle}</span>}
            </span>
          </figcaption>
        </figure>
      </div>
      {testimonials.length > 1 && (
        <div className="flex gap-2 md:col-span-3 md:justify-end">
          <button
            type="button"
            aria-label="Opinión anterior"
            onClick={() => go(-1)}
            className="grid size-12 place-items-center border border-line-strong hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Opinión siguiente"
            onClick={() => go(1)}
            className="grid size-12 place-items-center border border-line-strong hover:border-accent hover:text-accent"
          >
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
