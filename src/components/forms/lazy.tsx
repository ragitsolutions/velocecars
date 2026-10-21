"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps, type ComponentType } from "react";

/**
 * Formularios y calculadoras con carga diferida. Zod, React Hook Form y los controles de Radix
 * suman ~50 KB de JavaScript que no hacen falta para el primer pintado: el componente se monta
 * cuando su hueco se acerca a la pantalla o, como tarde, poco después de cargar la página.
 * Mientras tanto se reserva su altura aproximada para no desplazar el contenido.
 */
function WhenNeeded({ minHeight, children }: { minHeight: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const el = ref.current;
    const show = () => setReady(true);
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && show(), {
      rootMargin: "800px 0px",
    });
    if (el) observer.observe(el);
    // Tras la carga completa (y algo de margen) se monta igualmente: así está listo antes de
    // que se llegue con el scroll y los enlaces internos (#informacion, #cita) funcionan.
    let timer: number | undefined;
    const later = () => (timer = window.setTimeout(show, 2500));
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("load", later);
      window.clearTimeout(timer);
    };
  }, [ready]);

  return (
    <div ref={ref} style={ready ? undefined : { minHeight }}>
      {ready && children}
    </div>
  );
}

function lazy<P extends object>(load: () => Promise<ComponentType<P>>, minHeight: string) {
  const Component = dynamic(load, { ssr: false });
  function Lazy(props: P) {
    return (
      <WhenNeeded minHeight={minHeight}>
        <Component {...props} />
      </WhenNeeded>
    );
  }
  return Lazy;
}

type Props<T extends keyof typeof loaders> = ComponentProps<
  Awaited<ReturnType<(typeof loaders)[T]>>
>;

const loaders = {
  contact: () => import("./contact-form").then((m) => m.ContactForm),
  appointment: () => import("./appointment-form").then((m) => m.AppointmentForm),
  valuation: () => import("./valuation-form").then((m) => m.ValuationForm),
  calculator: () =>
    import("@/components/vehicle/financing-calculator").then((m) => m.FinancingCalculator),
  simulator: () =>
    import("@/components/vehicle/financing-simulator").then((m) => m.FinancingSimulator),
};

export const LazyContactForm = lazy<Props<"contact">>(loaders.contact, "44rem");
export const LazyAppointmentForm = lazy<Props<"appointment">>(loaders.appointment, "56rem");
export const LazyValuationForm = lazy<Props<"valuation">>(loaders.valuation, "34rem");
export const LazyFinancingCalculator = lazy<Props<"calculator">>(loaders.calculator, "22rem");
export const LazyFinancingSimulator = lazy<Props<"simulator">>(loaders.simulator, "30rem");
