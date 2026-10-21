import Link from "@/components/ui/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/format";

type Variant = "outline" | "solid" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap " +
  "font-sans font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ease-luxe " +
  "disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  // Borde fino; el relleno «barre» de izquierda a derecha al pasar el ratón.
  outline: "border border-fg/40 text-fg hover:border-accent hover:text-inverse",
  solid: "bg-accent text-inverse hover:bg-accent-hover",
  ghost: "text-fg hover:text-accent",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[0.6875rem]",
  md: "h-12 px-7 text-xs",
  lg: "h-14 px-9 text-xs",
};

function Sweep({ variant }: { variant: Variant }) {
  if (variant !== "outline") return null;
  return (
    <span
      aria-hidden
      className="absolute inset-0 -z-10 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-luxe group-hover/btn:scale-x-100 group-focus-visible/btn:scale-x-100"
    />
  );
}

type CommonProps = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function Button({
  variant = "outline",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], "isolate", className)} {...props}>
      <Sweep variant={variant} />
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "outline",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], "isolate", className)} {...props}>
      <Sweep variant={variant} />
      {children}
    </Link>
  );
}
