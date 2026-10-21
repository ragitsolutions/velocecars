"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "@/components/ui/link";
import { Heart, X } from "lucide-react";
import { FAVORITES_KEY, useStoredIds } from "@/hooks/use-stored-ids";
import { useVehicleSummaries } from "@/hooks/use-vehicle-summaries";
import { formatKm, formatPrice } from "@/lib/utils/format";

/** Botón + panel lateral con los vehículos guardados (localStorage del navegador). */
export function FavoritesDrawer() {
  const favorites = useStoredIds(FAVORITES_KEY);
  const items = useVehicleSummaries(favorites.ids);

  return (
    <Dialog.Root>
      <Dialog.Trigger className="inline-flex h-11 items-center gap-2 border border-line-strong px-4 text-xs font-semibold tracking-[0.14em] uppercase transition-colors hover:border-accent">
        <Heart className="size-4" strokeWidth={1.5} aria-hidden />
        Favoritos
        <span className="tabular text-accent">{favorites.ids.length}</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          data-lenis-prevent
          className="fixed inset-y-0 right-0 z-[var(--z-modal)] flex w-[min(28rem,100vw)] flex-col border-l border-line bg-bg-elevated data-[state=open]:animate-[fade-in_300ms_var(--ease-luxe)]"
        >
          <div className="flex items-center justify-between border-b border-line p-6">
            <Dialog.Title className="font-display text-2xl">Tus favoritos</Dialog.Title>
            <Dialog.Close aria-label="Cerrar" className="p-1 text-muted hover:text-fg">
              <X className="size-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Vehículos guardados en este navegador.
          </Dialog.Description>
          <div className="flex-1 overflow-y-auto p-6">
            {favorites.ids.length === 0 ? (
              <p className="text-sm text-muted">
                Aún no has guardado ningún vehículo. Pulsa el corazón de una tarjeta para tenerlo a
                mano aquí.
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((v) => (
                  <li key={v.id} className="relative flex gap-4 border border-line p-2">
                    <span className="relative h-20 w-28 shrink-0 overflow-hidden bg-bg">
                      {v.image && (
                        <Image src={v.image} alt="" fill sizes="112px" className="object-cover" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1 py-1 pr-6 text-sm">
                      <Dialog.Close asChild>
                        <Link href={v.href} className="block truncate text-fg hover:text-accent">
                          {v.brand} {v.model}
                        </Link>
                      </Dialog.Close>
                      <p className="truncate text-xs text-muted">{v.version}</p>
                      <p className="tabular mt-2 text-xs text-muted">
                        {v.year} · {formatKm(v.mileageKm)} ·{" "}
                        <span className="text-fg">{formatPrice(v.price)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => favorites.remove(v.id)}
                      aria-label={`Quitar ${v.brand} ${v.model} de favoritos`}
                      className="absolute top-2 right-2 p-1 text-muted hover:text-fg"
                    >
                      <X className="size-4" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="border-t border-line p-6 text-xs text-subtle">
            Los favoritos se guardan solo en este navegador.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
