/**
 * Consentimiento de cookies conforme a la Guía de cookies de la AEPD (2023):
 * aceptar / rechazar / configurar al mismo nivel, sin cookies no esenciales antes
 * del consentimiento y revocable en cualquier momento desde el footer.
 *
 * La decisión se guarda en una cookie técnica propia (exenta de consentimiento) de 13 meses.
 */
export const CONSENT_COOKIE = "vc_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 395; // ≈ 13 meses (recomendación AEPD: renovar ≤ 24 meses)
export const OPEN_SETTINGS_EVENT = "vc:open-cookie-settings";

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentState = {
  version: number;
  date: string;
  analytics: boolean;
  marketing: boolean;
};

export const CATEGORY_INFO: Record<
  ConsentCategory,
  { title: string; description: string; locked?: boolean }
> = {
  necessary: {
    title: "Necesarias",
    description:
      "Permiten el funcionamiento básico de la web y recordar tu elección sobre cookies. No pueden desactivarse.",
    locked: true,
  },
  analytics: {
    title: "Analíticas",
    description:
      "Nos ayudan a entender cómo se usa la web (páginas vistas, búsquedas de vehículos) para mejorarla. Google Tag Manager / Google Analytics.",
  },
  marketing: {
    title: "Marketing",
    description:
      "Permiten mostrarte publicidad relevante en otras plataformas y medir nuestras campañas.",
  },
};

export function parseConsent(raw: string | undefined | null): ConsentState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as ConsentState;
    return value.version === CONSENT_VERSION ? value : null;
  } catch {
    return null;
  }
}

export function readConsentCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return parseConsent(match?.[1]);
}

export function writeConsentCookie(state: Omit<ConsentState, "version" | "date">): ConsentState {
  const value: ConsentState = {
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
    ...state,
  };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${
    CONSENT_MAX_AGE_DAYS * 86400
  }; Path=/; SameSite=Lax${secure}`;
  return value;
}

export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));

/**
 * Script en línea para <head>: si ya existe la cookie de consentimiento, marca <html> para
 * que el banner (renderizado en el servidor) no llegue a pintarse. Así las páginas siguen
 * siendo estáticas y el banner no parpadea. También añade `js-reveal`, que activa los
 * revelados al hacer scroll (src/lib/reveal-script.ts): sin JavaScript todo queda visible.
 */
export const CONSENT_BOOT_SCRIPT = `document.documentElement.classList.add("js-reveal");try{if(/(?:^|; )${CONSENT_COOKIE}=/.test(document.cookie))document.documentElement.classList.add("vc-consented")}catch(e){}`;
