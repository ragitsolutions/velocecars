import Link from "@/components/ui/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/format";

/** Páginas visibles: primera, última y las vecinas de la actual, con «…» en los huecos. */
function pagesToShow(page: number, count: number): (number | "…")[] {
  const set = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push("…");
    out.push(p);
  });
  return out;
}

/**
 * Paginación con enlaces reales (rastreables y compartibles). `scroll={false}`: en lugar de ir
 * al principio de la página, InventoryProvider sube hasta el inicio de los resultados.
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  const base = "grid h-11 min-w-11 place-items-center border px-3 text-sm transition-colors";
  return (
    <nav
      aria-label="Paginación"
      data-pagination
      className="mt-14 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          scroll={false}
          className={cn(base, "border-line-strong hover:border-accent")}
          aria-label="Página anterior"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
        </Link>
      )}
      {pagesToShow(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-subtle" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            scroll={false}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Página ${p}`}
            className={cn(
              base,
              "tabular",
              p === page
                ? "border-accent bg-accent text-inverse"
                : "border-line text-muted hover:border-accent hover:text-fg",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {page < pageCount && (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          scroll={false}
          className={cn(base, "border-line-strong hover:border-accent")}
          aria-label="Página siguiente"
        >
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Link>
      )}
    </nav>
  );
}
