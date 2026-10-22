import Link from "@/components/ui/link";
import type { ReactNode } from "react";
import { WithPending } from "@/components/ui/pending";
import { PENDING, legalNav } from "@/lib/site";
import { fitHeading } from "@/lib/utils/fit-heading";
import { cn } from "@/lib/utils/format";

/**
 * Plantilla de los textos legales: titular, fecha de actualización, aviso de revisión y
 * cuerpo con tipografía de lectura (`.legal-prose`). Navegación entre documentos legales.
 */
export function LegalPage({
  title,
  updated,
  current,
  children,
}: {
  title: string;
  updated: string;
  current: string;
  children: ReactNode;
}) {
  return (
    <article className="pt-[calc(var(--header-h)+4rem)] pb-[var(--section-y)]">
      <div className="container-luxe grid gap-14 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav
            aria-label="Textos legales"
            className="lg:sticky lg:top-[calc(var(--header-h-compact)+2rem)]"
          >
            <p className="eyebrow mb-5">Legal</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm lg:flex-col">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={item.href === current ? "page" : undefined}
                    className={cn(
                      "transition-colors hover:text-fg",
                      item.href === current ? "text-fg" : "text-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="@container min-w-0 lg:col-span-8">
          <h1 className="fit [--size:var(--text-5xl)]" style={fitHeading(title)}>
            {title}
          </h1>
          <p className="mt-4 text-sm text-subtle">Última actualización: {updated}</p>
          <p className="mt-6 border-l border-accent/50 pl-4 text-sm text-subtle">
            <WithPending
              text={PENDING("revisión de este texto por la asesoría legal del cliente")}
            />
          </p>
          <div className="legal-prose mt-12">{children}</div>
        </div>
      </div>
    </article>
  );
}
