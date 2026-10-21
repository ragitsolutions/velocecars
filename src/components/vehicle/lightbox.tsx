"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import type { VehicleImage } from "@/lib/inventory/types";
import { cn } from "@/lib/utils/format";

/**
 * Visor a pantalla completa: flechas y teclado (← →, Esc), deslizar con el dedo, zoom
 * (doble clic / doble toque o botón) con desplazamiento arrastrando, y tira de miniaturas.
 */
export function Lightbox({
  images,
  open,
  index,
  onIndexChange,
  onOpenChange,
  title,
  returnFocusRef,
}: {
  images: VehicleImage[];
  open: boolean;
  index: number;
  onIndexChange: (i: number) => void;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Elemento que abrió el visor: recupera el foco al cerrarlo (se abre sin Dialog.Trigger). */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);
  const thumbs = useRef<HTMLUListElement>(null);
  const count = images.length;

  const go = useCallback(
    (d: number) => {
      setZoom(false);
      onIndexChange((index + d + count) % count);
    },
    [count, index, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  // Mantiene la miniatura activa a la vista.
  useEffect(() => {
    thumbs.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index, open]);

  const current = images[index];
  const toggleZoom = (clientX?: number, clientY?: number, rect?: DOMRect) => {
    if (!zoom && clientX !== undefined && rect) {
      setOrigin(
        `${((clientX - rect.left) / rect.width) * 100}% ${((clientY! - rect.top) / rect.height) * 100}%`,
      );
    }
    setZoom((z) => !z);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setZoom(false);
        onOpenChange(o);
      }}
    >
      <Dialog.Portal>
        <Dialog.Content
          data-lenis-prevent
          onCloseAutoFocus={(e) => {
            if (!returnFocusRef?.current) return;
            e.preventDefault();
            returnFocusRef.current.focus();
          }}
          className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-black/95 data-[state=open]:animate-[fade-in_250ms_ease-out]"
        >
          <Dialog.Title className="sr-only">Fotografías de {title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Usa las flechas para cambiar de foto y doble clic para ampliar.
          </Dialog.Description>

          <div className="flex items-center justify-between px-4 py-3 text-sm text-muted sm:px-6">
            <span className="tabular" aria-live="polite">
              {index + 1} / {count}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => toggleZoom()}
                aria-label={zoom ? "Reducir" : "Ampliar"}
                className="grid size-10 place-items-center hover:text-fg"
              >
                {zoom ? (
                  <ZoomOut className="size-5" strokeWidth={1.5} />
                ) : (
                  <ZoomIn className="size-5" strokeWidth={1.5} />
                )}
              </button>
              <Dialog.Close
                aria-label="Cerrar visor"
                className="grid size-10 place-items-center hover:text-fg"
              >
                <X className="size-6" strokeWidth={1.5} />
              </Dialog.Close>
            </div>
          </div>

          <div
            className={cn(
              "relative flex-1 touch-pan-y overflow-hidden select-none",
              zoom ? "cursor-zoom-out" : "cursor-zoom-in",
            )}
            onDoubleClick={(e) =>
              toggleZoom(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())
            }
            onPointerDown={(e) => (touch.current = { x: e.clientX, y: e.clientY, t: Date.now() })}
            onPointerMove={(e) => {
              if (!zoom || e.pointerType !== "mouse") return;
              const rect = e.currentTarget.getBoundingClientRect();
              setOrigin(
                `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`,
              );
            }}
            onPointerUp={(e) => {
              const start = touch.current;
              touch.current = null;
              if (!start || zoom) return;
              const dx = e.clientX - start.x;
              const dy = e.clientY - start.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && Date.now() - start.t < 600)
                go(dx < 0 ? 1 : -1);
            }}
          >
            {current && (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                priority
                className="object-contain transition-transform duration-500 ease-luxe"
                style={{ transform: zoom ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
                draggable={false}
              />
            )}
            {/* Precarga de las vecinas para que el cambio sea instantáneo */}
            {[images[(index + 1) % count], images[(index - 1 + count) % count]].map(
              (img) =>
                img && (
                  <Image
                    key={`pre-${img.src}`}
                    src={img.src}
                    alt=""
                    fill
                    sizes="100vw"
                    className="invisible"
                    aria-hidden
                  />
                ),
            )}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center border border-line-strong bg-bg/60 text-fg backdrop-blur-md hover:border-accent sm:left-6"
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto siguiente"
              className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center border border-line-strong bg-bg/60 text-fg backdrop-blur-md hover:border-accent sm:right-6"
            >
              <ChevronRight className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          <ul ref={thumbs} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {images.map((img, i) => (
              <li key={img.src} data-index={i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setZoom(false);
                    onIndexChange(i);
                  }}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "relative block h-14 w-20 overflow-hidden border transition-opacity",
                    i === index
                      ? "border-accent"
                      : "border-transparent opacity-50 hover:opacity-100",
                  )}
                >
                  <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
