"use client";

import Script from "next/script";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  OPEN_SETTINGS_EVENT,
  readConsentCookie,
  writeConsentCookie,
  type ConsentState,
} from "@/lib/consent";
import { CookieBanner } from "./cookie-banner";

type ConsentContextValue = {
  consent: ConsentState | null;
  /** true hasta que se lee la cookie en cliente (evita parpadeos del banner). */
  loading: boolean;
  save: (choice: { analytics: boolean; marketing: boolean }) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent debe usarse dentro de <ConsentProvider>");
  return ctx;
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // Marca de página hidratada (los efectos del padre corren tras los de todo su árbol):
    // los tests e2e la esperan antes de interactuar.
    document.documentElement.dataset.hydrated = "";
    const stored = readConsentCookie();
    setConsent(stored);
    // Cookie de una versión anterior del consentimiento: hay que volver a preguntar.
    if (!stored) document.documentElement.classList.remove("vc-consented");
    setLoading(false);
    const open = () => setSettingsOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  const save = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    const previous = readConsentCookie();
    setConsent(writeConsentCookie(choice));
    setSettingsOpen(false);
    // Retirar un consentimiento ya dado exige descargar los scripts: recargamos la página.
    if (
      previous &&
      ((previous.analytics && !choice.analytics) || (previous.marketing && !choice.marketing))
    ) {
      window.location.reload();
    }
  }, []);

  const value = useMemo(
    () => ({ consent, loading, save, settingsOpen, setSettingsOpen }),
    [consent, loading, save, settingsOpen],
  );

  const analyticsAllowed = Boolean(consent?.analytics && GTM_ID);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <CookieBanner />
      {analyticsAllowed && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
window.dataLayer.push({event:'consent_update',analytics_storage:'granted',ad_storage:'${consent?.marketing ? "granted" : "denied"}'});`}
        </Script>
      )}
    </ConsentContext.Provider>
  );
}
