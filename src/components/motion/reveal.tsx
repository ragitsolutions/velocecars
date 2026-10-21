import { Fragment, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/format";

/**
 * Revelados al hacer scroll (§6.2): fade-up para bloques, cascada para listas, máscara
 * palabra a palabra para titulares y zoom-out para imágenes.
 *
 * Sin JavaScript de React: son componentes de servidor que solo ponen atributos `data-reveal*`.
 * Las transiciones están en globals.css y un script en línea (`REVEAL_SCRIPT`, en el layout)
 * marca cada elemento con `data-inview` al entrar en pantalla. Antes iba con Motion, que añadía
 * ~45 KB al JavaScript inicial de todas las páginas.
 * Con `prefers-reduced-motion` todo se muestra directamente.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export function Reveal({
  delay = 0,
  y,
  style,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { delay?: number; y?: number }) {
  const vars: Vars = { ...style };
  if (delay) vars["--reveal-delay"] = `${delay}s`;
  if (y !== undefined) vars["--reveal-y"] = `${y}px`;
  return (
    <div data-reveal="" style={vars} {...props}>
      {children}
    </div>
  );
}

/** Lista en cascada: cada hijo directo (`RevealItem`) entra 80 ms después del anterior. */
export function RevealGroup({
  children,
  className,
  as: Comp = "ul",
}: {
  children: ReactNode;
  className?: string;
  as?: "ul" | "ol" | "div";
}) {
  return (
    <Comp data-reveal-group="" className={className}>
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as: Comp = "li",
}: {
  children: ReactNode;
  className?: string;
  as?: "li" | "div";
}) {
  return (
    <Comp data-reveal-item="" className={className}>
      {children}
    </Comp>
  );
}

/** Titular que aparece palabra a palabra tras una máscara. */
export function RevealText({
  text,
  as: Comp = "h2",
  className,
  delay = 0,
  id,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  id?: string;
}) {
  const words = text.split(" ");
  return (
    <Comp
      data-reveal-text=""
      className={className}
      aria-label={text}
      id={id}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as Vars) : undefined}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span data-reveal-word="" className="inline-block" style={{ "--i": i } as Vars}>
              {word}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Comp>
  );
}

/** Contenedor de imagen con zoom-out suave (1,08 → 1) al entrar. */
export function RevealImage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div data-reveal-image="" className="relative size-full">
        {children}
      </div>
    </div>
  );
}
