"use client";

import { useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { site } from "@/lib/site";
import { useConsent } from "./consent-provider";

const EMBED_URL = `https://www.google.com/maps?q=${site.address.geo.lat},${site.address.geo.lng}&z=16&hl=es&output=embed`;

/**
 * Mapa de Google Maps. Google instala cookies propias, así que el iframe solo se carga con
 * consentimiento de marketing o si la persona lo pide expresamente con el botón.
 */
export function ConsentMap() {
  const { consent } = useConsent();
  const [requested, setRequested] = useState(false);
  const load = requested || !!consent?.marketing;

  return (
    <div className="relative aspect-[4/3] overflow-hidden border border-line bg-bg-elevated sm:aspect-[16/9]">
      {load ? (
        <iframe
          title={`Mapa: ${site.address.street}, ${site.address.city}`}
          src={EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full [filter:invert(90%)_hue-rotate(180deg)_grayscale(0.4)_contrast(0.9)]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
          <MapPin className="size-8 text-accent" strokeWidth={1.25} aria-hidden />
          <p className="max-w-sm text-sm text-muted">
            {site.address.street}, {site.address.postalCode} {site.address.city}. Al cargar el mapa,
            Google puede instalar sus propias cookies.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setRequested(true)}
              className="h-10 border border-line-strong px-5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors hover:border-accent"
            >
              Cargar mapa
            </button>
            <a
              href={site.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 px-3 text-xs text-muted hover:text-fg"
            >
              Abrir en Google Maps <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
