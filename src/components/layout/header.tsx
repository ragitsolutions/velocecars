"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "@/components/ui/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import type { BrandSummary } from "@/lib/inventory/types";
import { mainNav, site } from "@/lib/site";
import { cn } from "@/lib/utils/format";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const SOLID_AFTER = 80;
const HIDE_AFTER = 240;

/** Transparente sobre el hero, sólida con blur al hacer scroll, se oculta al bajar y vuelve al subir. */
function useHeaderState(transparentAtTop: boolean) {
  const [state, setState] = useState({ solid: !transparentAtTop, hidden: false });
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const goingDown = y > last + 4;
      const goingUp = y < last - 4;
      setState((s) => ({
        solid: !transparentAtTop || y > SOLID_AFTER,
        hidden: goingDown && y > HIDE_AFTER ? true : goingUp || y < HIDE_AFTER ? false : s.hidden,
      }));
      last = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentAtTop]);
  return state;
}

export function Header({ brands, total }: { brands: BrandSummary[]; total: number }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { solid, hidden } = useHeaderState(isHome);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLLIElement>(null);
  const hoverOpenedAt = useRef(0);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOpen(false);
    const onClick = (e: MouseEvent) =>
      megaRef.current && !megaRef.current.contains(e.target as Node) && setMegaOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [megaOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const elevated = solid || megaOpen;

  return (
    <header
      data-site-header
      data-solid={elevated}
      className={cn(
        "fixed inset-x-0 top-0 z-[var(--z-header)] transition-[transform,background-color,border-color,height] duration-500 ease-luxe",
        elevated
          ? "border-b border-line bg-bg/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-gradient-to-b from-black/60 to-transparent",
        hidden && !megaOpen && "-translate-y-full",
      )}
    >
      <div
        className={cn(
          "container-luxe flex items-center justify-between gap-8 transition-[height] duration-500 ease-luxe",
          solid ? "h-[var(--header-h-compact)]" : "h-[var(--header-h)]",
        )}
      >
        <Logo priority className="w-36 shrink-0 sm:w-44" />

        <nav aria-label="Principal" className="hidden h-full items-center lg:flex">
          <ul className="flex h-full items-center gap-1 xl:gap-3">
            {mainNav.map((item) =>
              item.href === "/vehiculos" ? (
                <li
                  key={item.href}
                  ref={megaRef}
                  className="flex h-full items-center"
                  onMouseEnter={() => {
                    hoverOpenedAt.current = Date.now();
                    setMegaOpen(true);
                  }}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <div className="flex items-center">
                    <NavLink href={item.href} active={isActive(item.href)}>
                      {item.label}
                    </NavLink>
                    <button
                      type="button"
                      aria-expanded={megaOpen}
                      aria-controls={megaOpen ? "megamenu-vehiculos" : undefined}
                      aria-label="Abrir menú de marcas"
                      onClick={() =>
                        // Con ratón, el hover ya lo abrió justo antes del clic: no lo cerramos.
                        setMegaOpen((o) => (Date.now() - hoverOpenedAt.current < 500 ? true : !o))
                      }
                      className="-ml-2 p-2 text-muted hover:text-fg"
                    >
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform duration-300",
                          megaOpen && "rotate-180",
                        )}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                  {/* Solo se renderiza abierto: ~90 nodos menos que parsear e hidratar en cada
                      página (las marcas también están enlazadas en el pie). */}
                  {megaOpen && <MegaMenu open brands={brands} total={total} />}
                </li>
              ) : (
                <li key={item.href}>
                  <NavLink href={item.href} active={isActive(item.href)}>
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={`tel:${site.contact.phone.e164}`}
            className="hidden items-center gap-2 text-sm text-muted transition-colors hover:text-fg xl:flex"
          >
            <Phone className="size-4" strokeWidth={1.5} aria-hidden />
            <span className="tabular">{site.contact.phone.display}</span>
          </a>
          <ButtonLink href="/contacto#cita" size="sm" className="hidden sm:inline-flex">
            Reservar cita
          </ButtonLink>
          <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} brands={brands} />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative px-3 py-2 text-[0.8125rem] font-medium tracking-wide transition-colors duration-300",
        active ? "text-fg" : "text-fg/75 hover:text-fg",
        "after:absolute after:inset-x-3 after:bottom-0 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-500 after:ease-luxe",
        active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
      )}
    >
      {children}
    </Link>
  );
}

function MegaMenu({
  open,
  brands,
  total,
}: {
  open: boolean;
  brands: BrandSummary[];
  total: number;
}) {
  return (
    <div
      id="megamenu-vehiculos"
      hidden={!open}
      className="absolute inset-x-0 top-full border-b border-line bg-bg/95 backdrop-blur-xl"
    >
      <div className="container-luxe grid grid-cols-12 gap-10 py-12">
        <div className="col-span-3 flex flex-col gap-5 border-r border-line pr-10">
          <p className="eyebrow">Inventario</p>
          <p className="font-display text-3xl leading-tight">
            {total} vehículos seleccionados, revisados y listos para entregar.
          </p>
          <ButtonLink href="/vehiculos" size="sm" className="self-start">
            Ver todo el stock
          </ButtonLink>
        </div>
        <ul className="col-span-9 grid grid-cols-4 gap-x-8 gap-y-1">
          {brands.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/vehiculos/${b.slug}`}
                className="group flex items-baseline justify-between gap-3 border-b border-line py-3 text-fg/80 transition-colors hover:text-fg"
              >
                <span className="font-display text-xl transition-transform duration-300 ease-luxe group-hover:translate-x-1">
                  {b.name}
                </span>
                <span className="tabular text-xs text-subtle group-hover:text-accent">
                  {b.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MobileMenu({
  open,
  onOpenChange,
  brands,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brands: BrandSummary[];
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger
        className="-mr-2 p-2 text-fg lg:hidden"
        aria-label="Abrir menú"
        data-testid="mobile-menu-trigger"
      >
        <Menu className="size-6" strokeWidth={1.25} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          data-lenis-prevent
          className="fixed inset-0 z-[var(--z-overlay)] flex flex-col overflow-y-auto bg-bg data-[state=open]:animate-[fade-in_400ms_var(--ease-luxe)]"
        >
          <div className="container-luxe flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <Logo className="w-36" />
            <Dialog.Close className="-mr-2 p-2" aria-label="Cerrar menú">
              <X className="size-6" strokeWidth={1.25} />
            </Dialog.Close>
          </div>
          <Dialog.Title className="sr-only">Menú</Dialog.Title>
          <Dialog.Description className="sr-only">
            Navegación principal de Veloce Cars
          </Dialog.Description>
          <nav aria-label="Principal móvil" className="container-luxe flex-1 py-6">
            <ul className="border-t border-line">
              {mainNav.map((item, i) => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    className="flex items-baseline gap-4 py-5 font-display text-3xl"
                    onClick={() => onOpenChange(false)}
                  >
                    <span className="eyebrow tabular">{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-10 mb-4">Marcas en stock</p>
            <ul className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/vehiculos/${b.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="inline-flex items-center gap-2 border border-line px-3 py-2 text-sm text-muted hover:border-accent hover:text-fg"
                  >
                    {b.name} <span className="tabular text-xs text-subtle">{b.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="container-luxe grid shrink-0 gap-3 border-t border-line py-6 sm:grid-cols-2">
            <ButtonLink href="/contacto#cita" onClick={() => onOpenChange(false)}>
              Reservar cita
            </ButtonLink>
            <ButtonLink href={`tel:${site.contact.phone.e164}`} variant="ghost">
              <Phone className="size-4" strokeWidth={1.5} aria-hidden />{" "}
              {site.contact.phone.display}
            </ButtonLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
