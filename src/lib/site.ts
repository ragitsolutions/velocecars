/**
 * Datos corporativos y de contacto. Fuente: auditoría de la web actual (docs/auditoria-web-actual.md §10).
 * Los valores pendientes de confirmar llevan `pending` y se muestran con el marcador [[PENDIENTE]]
 * (ver docs/pendientes-cliente.md).
 */

export const PENDING = (what: string) => `[[PENDIENTE: ${what}]]`;

export const site = {
  name: "Veloce Cars",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.velocecars.es",
  locale: "es-ES",
  claim: "Asesoría automovilística",
  /** B-A2: el lema del briefing no aparece en la web actual; se usa cuando el cliente lo confirme. */
  tagline: "Tu coche, tu decisión, nuestra prioridad",
  taglineConfirmed: false,
  description:
    "Compraventa y gestión de venta de vehículos premium y de lujo en Pozuelo de Alarcón (Madrid). Tasación, trámites, garantía y atención con cita previa.",

  company: {
    legalName: "Casado Aguilera Motor SL",
    taxId: "B55499149",
    registry: PENDING("datos registrales"),
  },

  address: {
    street: "Avenida de Luis García Cereceda, 5",
    postalCode: "28223",
    city: "Pozuelo de Alarcón",
    region: "Madrid",
    country: "ES",
    area: "La Finca",
    geo: { lat: 40.4038716, lng: -3.7921312 },
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=40.4038716,-3.7921312",
  },

  contact: {
    /** B1: la web usa ambos números; pendiente de decidir cuál es el principal. */
    phone: { display: "618 040 537", e164: "+34618040537" },
    phoneAlt: { display: "619 625 040", e164: "+34619625040" },
    whatsapp: {
      e164: "34618040537",
      message: "Hola Veloce Cars, me gustaría obtener más información.",
    },
    /** B2: también se usa velocecars1@gmail.com (contacto y legales). */
    email: "contacto@velocecars.es",
    privacyEmail: "velocecars1@gmail.com",
  },

  schedule: {
    note: "Atendemos con cita previa",
    /** B3: sin horario publicado en la web actual. */
    hours: PENDING("horario de atención"),
  },

  social: {
    instagram: { handle: "@veloce_cars", url: "https://www.instagram.com/veloce_cars" },
    tiktok: { handle: "@velocecar", url: "https://www.tiktok.com/@velocecar" },
  },
} as const;

export const whatsappUrl = (message: string = site.contact.whatsapp.message) =>
  `https://wa.me/${site.contact.whatsapp.e164}?text=${encodeURIComponent(message)}`;

export type NavItem = { label: string; href: string; description?: string };

export const mainNav: NavItem[] = [
  { label: "Vehículos", href: "/vehiculos" },
  { label: "Vendemos tu coche", href: "/vendemos-tu-coche" },
  { label: "Servicios", href: "/servicios" },
  { label: "Financiación", href: "/financiacion" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export const legalNav: NavItem[] = [
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de privacidad", href: "/politica-privacidad" },
  { label: "Política de cookies", href: "/politica-cookies" },
  { label: "Condiciones de uso", href: "/condiciones-de-uso" },
];

/** Fecha de la última revisión de los textos legales. */
export const LEGAL_UPDATED = "20 de octubre de 2026";
