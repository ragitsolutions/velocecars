"use client";

import { useState } from "react";
import { Check, Printer, Share2 } from "lucide-react";

/** Compartir (menú nativo del sistema o copiar enlace) e imprimir la ficha (hoja de estilo de impresión). */
export function SharePrint({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Cancelado por el usuario: no hacemos nada.
        return;
      }
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const button =
    "inline-flex h-10 flex-1 items-center justify-center gap-2 border border-line text-xs text-muted transition-colors hover:border-accent hover:text-fg";
  return (
    <div className="flex gap-2 print:hidden">
      <button type="button" onClick={share} className={button}>
        {copied ? (
          <Check className="size-4" strokeWidth={1.5} aria-hidden />
        ) : (
          <Share2 className="size-4" strokeWidth={1.5} aria-hidden />
        )}
        {copied ? "Enlace copiado" : "Compartir"}
      </button>
      <button type="button" onClick={() => window.print()} className={button}>
        <Printer className="size-4" strokeWidth={1.5} aria-hidden />
        Imprimir ficha
      </button>
    </div>
  );
}
