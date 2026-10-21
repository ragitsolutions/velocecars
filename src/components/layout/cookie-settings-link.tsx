"use client";

import { openCookieSettings } from "@/lib/consent";
import { cn } from "@/lib/utils/format";

/** Permite revocar o cambiar el consentimiento en cualquier momento (requisito AEPD). */
export function CookieSettingsLink({
  className,
  children = "Configurar cookies",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openCookieSettings} className={cn("hover:text-fg", className)}>
      {children}
    </button>
  );
}
