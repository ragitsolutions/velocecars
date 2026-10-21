import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/format";

/** Cabecera de página interior: imagen de estudio del cliente a sangre con velo oscuro. */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  image?: { src: string; alt: string };
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        // Móvil: texto arriba (si la fuente de cuerpo cambia el alto de la entradilla, solo se
        // mueven los botones, no todo el bloque); desde tableta, anclado abajo sobre la foto.
        "relative isolate flex min-h-[86svh] items-start overflow-hidden pt-[var(--header-h)] sm:min-h-[62svh] sm:items-end",
        className,
      )}
    >
      {image && (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="-z-20 object-cover object-center"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-bg/85 via-bg/60 to-bg sm:bg-gradient-to-t sm:from-bg sm:via-bg/70 sm:to-bg/30"
          />
        </>
      )}
      <div className="container-luxe pt-12 pb-16 sm:pt-24 lg:pb-24">
        <p className="eyebrow mb-6">{eyebrow}</p>
        <h1 className="max-w-4xl text-4xl sm:text-5xl">{title}</h1>
        {intro && <div className="mt-6 max-w-2xl text-lg text-muted">{intro}</div>}
        {children && <div className="mt-10 flex flex-wrap gap-4">{children}</div>}
      </div>
    </section>
  );
}
