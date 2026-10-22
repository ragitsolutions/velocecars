import type { ReactNode } from "react";
import { fitHeading } from "@/lib/utils/fit-heading";
import { cn } from "@/lib/utils/format";

type Props = {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
};

/** Cabecera de sección con numeración «01 / Inventario», titular display e introducción. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  as: Tag = "h2",
  align = "left",
  className,
}: Props) {
  return (
    <header
      className={cn(
        // @container: el titular se ajusta a su ancho (fitHeading). Dentro de una fila flex, el
        // contenedor necesita ancho propio (`min-w-0 flex-1` en el envoltorio).
        "@container flex max-w-3xl flex-col gap-5",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      <p className="eyebrow flex items-center gap-3">
        {index && (
          <>
            <span className="tabular">{index}</span>
            <span aria-hidden className="h-px w-8 bg-accent/60" />
          </>
        )}
        {eyebrow}
      </p>
      <Tag
        className={cn(
          "fit",
          Tag === "h1" ? "[--size:var(--text-5xl)]" : "[--size:var(--text-4xl)]",
        )}
        style={fitHeading(title)}
      >
        {title}
      </Tag>
      {intro && <div className="max-w-2xl text-lg text-muted">{intro}</div>}
    </header>
  );
}
