"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { processSteps } from "@/content/home";
import { fitHeading } from "@/lib/utils/fit-heading";

/**
 * Proceso de venta en 4 pasos. La línea se dibuja con el scroll (stroke-dashoffset sobre un
 * path normalizado con pathLength=1) y cada paso se ilumina cuando la línea lo alcanza.
 * Sin GSAP: un listener de scroll pasivo calcula el avance y una transición CSS lo suaviza.
 */
export function ProcessSection({
  index = "05",
  ctaHref = "/vendemos-tu-coche",
}: {
  index?: string;
  ctaHref?: string;
}) {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = scope.current;
    const track = root?.querySelector<HTMLElement>("[data-process-track]");
    if (!root || !track) return;
    const steps = [...root.querySelectorAll<HTMLElement>("[data-step]")];
    const lines = [...root.querySelectorAll<SVGPathElement>("[data-process-line]")];
    const render = (p: number) => {
      lines.forEach((l) => (l.style.strokeDashoffset = String(1 - p)));
      steps.forEach((el, i) => {
        el.dataset.active = String(p >= i / (steps.length - 1) - 0.02);
      });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(1);
      return;
    }
    // Empieza con la parte alta del recorrido al 75 % de la pantalla y termina con la baja al 45 %.
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const { top, height } = track.getBoundingClientRect();
      render(Math.min(1, Math.max(0, (0.75 * vh - top) / (0.3 * vh + height))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={scope} aria-labelledby="proceso-title" className="section border-t border-line">
      <div className="container-luxe">
        <Reveal className="mb-20">
          <SectionHeading
            index={index}
            eyebrow="Proceso"
            title={<span id="proceso-title">Así vendemos tu coche</span>}
            intro="Cuatro pasos, un único interlocutor. Sin compromiso hasta que tú decidas."
          />
        </Reveal>

        <div data-process-track className="relative">
          {/* Línea horizontal (escritorio) */}
          <svg
            aria-hidden
            className="absolute top-[0.4375rem] left-0 hidden h-px w-full overflow-visible md:block"
            preserveAspectRatio="none"
            viewBox="0 0 100 1"
          >
            <path
              d="M0 0.5 H100"
              stroke="var(--line-strong)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <path
              data-process-line
              strokeDashoffset={1}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
              d="M0 0.5 H100"
              pathLength={1}
              strokeDasharray="1"
              stroke="var(--accent)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* Línea vertical (móvil) */}
          <svg
            aria-hidden
            className="absolute top-0 left-[0.4375rem] h-full w-px overflow-visible md:hidden"
            preserveAspectRatio="none"
            viewBox="0 0 1 100"
          >
            <path
              d="M0.5 0 V100"
              stroke="var(--line-strong)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <path
              data-process-line
              strokeDashoffset={1}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
              d="M0.5 0 V100"
              pathLength={1}
              strokeDasharray="1"
              stroke="var(--accent)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="relative grid gap-12 md:grid-cols-4 md:gap-10">
            {processSteps.map((step, i) => (
              <li
                key={step.title}
                data-step
                data-active="true"
                className="group @container relative pl-10 md:pl-0"
              >
                <span
                  aria-hidden
                  className="absolute left-0 mt-0 grid size-3.5 place-items-center rounded-full border border-line-strong bg-bg transition-colors duration-500 group-data-[active=true]:border-accent md:relative md:mb-8"
                >
                  <span className="size-1.5 rounded-full bg-accent opacity-0 transition-opacity duration-500 group-data-[active=true]:opacity-100" />
                </span>
                <p className="tabular mb-3 text-xs tracking-[0.2em] text-subtle transition-colors duration-500 group-data-[active=true]:text-accent">
                  PASO {String(i + 1).padStart(2, "0")}
                </p>
                <h3
                  className="fit mb-3 text-fg/50 transition-colors duration-700 [--size:var(--text-2xl)] group-data-[active=true]:text-fg"
                  style={fitHeading(step.title)}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-16">
          <ButtonLink href={ctaHref}>Empezar la tasación</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
