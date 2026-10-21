import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils/format";

/** Buscador del inventario: formulario GET a /vehiculos?q=… (funciona sin JavaScript). */
export function SearchForm({
  id,
  placeholder,
  className,
  style,
}: {
  id: string;
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <form
      action="/vehiculos"
      method="get"
      role="search"
      className={cn(
        "flex max-w-xl border border-line-strong bg-bg/70 backdrop-blur-md focus-within:border-accent",
        className,
      )}
      style={style}
    >
      <label htmlFor={id} className="sr-only">
        Buscar vehículo
      </label>
      <Search
        className="ml-4 size-4 shrink-0 self-center text-muted"
        strokeWidth={1.5}
        aria-hidden
      />
      <input
        id={id}
        name="q"
        type="search"
        placeholder={placeholder}
        className="h-14 min-w-0 flex-1 bg-transparent px-3 text-sm text-fg placeholder:text-subtle focus:outline-none"
      />
      <button
        type="submit"
        className="flex shrink-0 items-center gap-2 bg-accent px-5 text-xs font-semibold tracking-[0.16em] text-inverse uppercase transition-colors hover:bg-accent-hover sm:px-7"
      >
        Buscar
        <ArrowRight className="hidden size-4 sm:block" strokeWidth={1.5} aria-hidden />
      </button>
    </form>
  );
}
