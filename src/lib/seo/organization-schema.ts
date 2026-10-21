import { site } from "@/lib/site";

/** schema.org/AutoDealer del concesionario (todas las páginas). Sin horario: no está publicado. */
export function autoDealerSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${site.url}/#organizacion`,
    name: site.name,
    legalName: site.company.legalName,
    taxID: site.company.taxId,
    description: site.description,
    url: site.url,
    logo: `${site.url}/assets/original/logo-veloce.png`,
    image: `${site.url}/assets/original/propuesta-asesoria.jpg`,
    telephone: site.contact.phone.e164,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.address.geo.lat,
      longitude: site.address.geo.lng,
    },
    hasMap: site.address.mapsUrl,
    sameAs: [site.social.instagram.url, site.social.tiktok.url],
    areaServed: "Madrid",
  };
}
