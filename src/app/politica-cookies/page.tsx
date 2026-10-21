import type { Metadata } from "next";
import { CookieSettingsLink } from "@/components/layout/cookie-settings-link";
import { LegalPage } from "@/components/layout/legal-page";
import { WithPending } from "@/components/ui/pending";
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS } from "@/lib/consent";
import { LEGAL_UPDATED, PENDING, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "Qué cookies y tecnologías similares utiliza la web de Veloce Cars y cómo gestionarlas.",
  alternates: { canonical: "/politica-cookies" },
};

/** Inventario real de cookies y almacenamiento de la web (actualizar si se añaden servicios). */
const COOKIES = [
  {
    name: CONSENT_COOKIE,
    owner: `${site.name} (propia)`,
    type: "Técnica",
    purpose: "Recordar su elección sobre cookies",
    duration: `${CONSENT_MAX_AGE_DAYS} días`,
  },
  {
    name: "vc-favoritos, vc-comparar",
    owner: `${site.name} (almacenamiento local)`,
    type: "Técnica / preferencias",
    purpose: "Guardar los vehículos favoritos y los seleccionados para comparar en su navegador",
    duration: "Hasta que usted los borre",
  },
  {
    name: "vc-tasacion",
    owner: `${site.name} (almacenamiento de sesión)`,
    type: "Técnica",
    purpose: "No perder el formulario de tasación si recarga la página",
    duration: "Hasta cerrar el navegador",
  },
  {
    name: "_ga, _ga_*",
    owner: "Google (tercero)",
    type: "Analítica (requiere consentimiento)",
    purpose: "Distinguir visitas y medir el uso de la web",
    duration: "Hasta 2 años",
  },
  {
    name: "NID, AEC y otras de Google Maps",
    owner: "Google (tercero)",
    type: "Terceros (requiere consentimiento o carga voluntaria del mapa)",
    purpose: "Funcionamiento y preferencias del mapa embebido en Contacto",
    duration: "Hasta 6 meses",
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Política de cookies" updated={LEGAL_UPDATED} current="/politica-cookies">
      <h2>1. Qué son las cookies</h2>
      <p>
        Las cookies son pequeños archivos que se almacenan en su navegador al visitar una web. Junto
        con tecnologías similares (como el almacenamiento local), permiten que la web funcione,
        recordar sus preferencias o analizar el tráfico.
      </p>

      <h2>2. Cookies que utilizamos</h2>
      <p>
        Solo usamos cookies técnicas, necesarias para el funcionamiento de la web, sin pedir su
        consentimiento. Las analíticas y las de terceros{" "}
        <strong>no se instalan hasta que usted las acepta</strong> en el panel de configuración.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Titular</th>
            <th scope="col">Tipo</th>
            <th scope="col">Finalidad</th>
            <th scope="col">Duración</th>
          </tr>
        </thead>
        <tbody>
          {COOKIES.map((c) => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td>{c.owner}</td>
              <td>{c.type}</td>
              <td>{c.purpose}</td>
              <td>{c.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Por ahora no utilizamos cookies de marketing.{" "}
        <WithPending
          text={PENDING(
            "actualizar la tabla si se activan GTM, píxeles publicitarios u otros servicios",
          )}
        />
      </p>

      <h2>3. Cómo gestionar las cookies</h2>
      <p>
        Puede aceptar, rechazar o configurar las cookies por categorías en el banner que aparece en
        su primera visita y cambiar su decisión en cualquier momento desde el enlace «Configurar
        cookies» del pie de página o aquí mismo:
      </p>
      <p>
        <CookieSettingsLink className="border border-line-strong px-5 py-3 text-xs font-semibold tracking-[0.16em] text-fg uppercase no-underline hover:border-accent" />
      </p>
      <p>
        También puede bloquear o eliminar las cookies desde la configuración de su navegador. Si
        bloquea las técnicas, algunas funciones (como recordar sus favoritos) pueden no estar
        disponibles.
      </p>

      <h2>4. Actualizaciones</h2>
      <p>
        Revisaremos esta política cuando cambien los servicios utilizados. Su consentimiento se
        solicitará de nuevo, como máximo, cada 13 meses.
      </p>
    </LegalPage>
  );
}
