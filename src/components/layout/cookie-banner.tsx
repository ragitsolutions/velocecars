"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "@/components/ui/link";
import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { CATEGORY_INFO, type ConsentCategory } from "@/lib/consent";
import { Button } from "@/components/ui/button";
import { useConsent } from "./consent-provider";

/**
 * Banner de primera capa + panel de configuración. Los tres botones tienen el mismo
 * peso visual, como exige la AEPD (rechazar debe ser tan fácil como aceptar).
 */
export function CookieBanner() {
  const { consent, save, settingsOpen, setSettingsOpen } = useConsent();
  // Se renderiza ya en el servidor (se pinta con el primer render, no retrasa el LCP); si hay
  // consentimiento guardado, el script de <head> (CONSENT_BOOT_SCRIPT) lo oculta antes de pintar.
  const showBanner = !consent && !settingsOpen;

  return (
    <>
      {showBanner && (
        <section
          role="region"
          aria-label="Aviso de cookies"
          data-testid="cookie-banner"
          data-cookie-banner
          className="fixed inset-x-0 bottom-0 z-[var(--z-cookie)] border-t border-line bg-bg-secondary/95 backdrop-blur-md"
        >
          {/* Altura mínima reservada: al cargar las fuentes web el texto puede cambiar de líneas
              y, sin reserva, el banner (anclado abajo) desplazaría su borde superior (CLS). */}
          <div className="container-luxe flex min-h-[12.5rem] flex-col justify-center gap-4 py-5 sm:min-h-[9.5rem] lg:min-h-0 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-3xl text-[0.8125rem] leading-relaxed text-muted">
              <p className="mb-1 text-sm font-semibold text-fg">Tu privacidad, a tu medida</p>
              <p>
                Usamos cookies propias necesarias y, solo con tu permiso, cookies analíticas y de
                marketing propias y de terceros. Más información en la{" "}
                <Link href="/politica-cookies" className="text-fg underline underline-offset-4">
                  política de cookies
                </Link>
                .
              </p>
            </div>
            {/* Mismo tamaño y peso visual para las tres opciones (guía AEPD). */}
            <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3">
              {(
                [
                  ["Rechazar", () => save({ analytics: false, marketing: false })],
                  ["Configurar", () => setSettingsOpen(true)],
                  ["Aceptar", () => save({ analytics: true, marketing: true })],
                ] as const
              ).map(([label, onClick]) => (
                <Button
                  key={label}
                  size="sm"
                  onClick={onClick}
                  className="px-1 tracking-[0.1em] sm:px-5 sm:tracking-[0.18em]"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}
      <CookieSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

function CookieSettings({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { consent, save } = useConsent();
  const [choice, setChoice] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    if (open) setChoice({ analytics: !!consent?.analytics, marketing: !!consent?.marketing });
  }, [open, consent]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          data-testid="cookie-settings"
          data-lenis-prevent
          className="fixed top-1/2 left-1/2 z-[var(--z-modal)] max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-bg-elevated p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <Dialog.Title className="font-display text-3xl">Configurar cookies</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-muted">
                Elige qué categorías aceptas. Puedes cambiar de opinión cuando quieras desde el
                enlace «Configurar cookies» del pie de página.
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1 text-muted hover:text-fg" aria-label="Cerrar">
              <X className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {(Object.keys(CATEGORY_INFO) as ConsentCategory[]).map((key) => (
              <CategoryRow
                key={key}
                category={key}
                checked={key === "necessary" ? true : choice[key]}
                onChange={(value) =>
                  key !== "necessary" && setChoice((c) => ({ ...c, [key]: value }))
                }
              />
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button size="sm" onClick={() => save({ analytics: false, marketing: false })}>
              Rechazar todas
            </Button>
            <Button size="sm" onClick={() => save(choice)}>
              Guardar selección
            </Button>
            <Button size="sm" onClick={() => save({ analytics: true, marketing: true })}>
              Aceptar todas
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CategoryRow({
  category,
  checked,
  onChange,
}: {
  category: ConsentCategory;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  const info = CATEGORY_INFO[category];
  return (
    <li className="flex items-start justify-between gap-6 py-4">
      <div>
        <label htmlFor={id} className="font-semibold">
          {info.title}
        </label>
        <p className="mt-1 text-sm text-muted">{info.description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={info.locked}
        onClick={() => onChange(!checked)}
        className="relative mt-1 h-6 w-11 shrink-0 rounded-full border border-line-strong transition-colors duration-300 disabled:opacity-60 aria-checked:border-accent aria-checked:bg-accent-soft"
      >
        <span className="sr-only">{checked ? "Activadas" : "Desactivadas"}</span>
        <span
          aria-hidden
          className={`absolute top-1/2 left-1 size-4 -translate-y-1/2 rounded-full transition-all duration-300 ease-luxe ${
            checked ? "translate-x-5 bg-accent" : "bg-muted"
          }`}
        />
      </button>
    </li>
  );
}
