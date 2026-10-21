"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Images } from "lucide-react";
import type { VehicleImage } from "@/lib/inventory/types";
import { cn } from "@/lib/utils/format";
import dynamic from "next/dynamic";

// El visor (Radix Dialog + gestos) solo se descarga al abrirlo o al acercarse a la galería.
const loadLightbox = () => import("./lightbox").then((m) => m.Lightbox);
const Lightbox = dynamic(loadLightbox, { ssr: false });

/**
 * Galería de la ficha: foto principal grande + mosaico de 4 y botón «Ver las N fotos».
 * La foto principal comparte `view-transition-name` con la de la tarjeta del inventario.
 */
export function VehicleGallery({
  images,
  title,
  transitionName,
}: {
  images: VehicleImage[];
  title: string;
  transitionName: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const opener = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const show = (i: number) => {
    setMounted(true);
    opener.current = document.activeElement as HTMLElement | null;
    setIndex(i);
    setOpen(true);
  };
  const [main, ...rest] = images;
  const mosaic = rest.slice(0, 4);

  return (
    <div
      className="grid gap-2 lg:grid-cols-4 lg:grid-rows-2"
      onPointerEnter={() => void loadLightbox()}
      onFocus={() => void loadLightbox()}
      onTouchStart={() => void loadLightbox()}
    >
      {main && (
        <button
          type="button"
          onClick={() => show(0)}
          aria-label={`Abrir galería de ${title}`}
          className="group relative aspect-[4/3] overflow-hidden bg-bg-elevated lg:col-span-3 lg:row-span-2 lg:aspect-auto lg:min-h-[32rem]"
          style={{ viewTransitionName: transitionName }}
        >
          <Image
            src={main.src}
            alt={main.alt}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-luxe group-hover:scale-[1.02]"
          />
        </button>
      )}
      <div className="grid grid-cols-4 gap-2 lg:col-span-1 lg:row-span-2 lg:grid-cols-1 lg:grid-rows-4">
        {mosaic.map((img, i) => {
          const last = i === mosaic.length - 1;
          return (
            <button
              key={img.src}
              type="button"
              onClick={() => show(i + 1)}
              aria-label={last ? `Ver las ${images.length} fotos` : `Ver foto ${i + 2}`}
              className="group relative aspect-[4/3] overflow-hidden bg-bg-elevated lg:aspect-auto"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 15vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-700 ease-luxe group-hover:scale-105",
                  last && "brightness-[0.4]",
                )}
              />
              {last && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs font-semibold tracking-[0.14em] text-fg uppercase">
                  <Images className="size-5" strokeWidth={1.5} aria-hidden />
                  <span className="hidden sm:inline">Ver las</span> {images.length}
                  <span className="hidden sm:inline">fotos</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {mounted && (
        <Lightbox
          images={images}
          open={open}
          index={index}
          onIndexChange={setIndex}
          onOpenChange={setOpen}
          title={title}
          returnFocusRef={opener}
        />
      )}
    </div>
  );
}
