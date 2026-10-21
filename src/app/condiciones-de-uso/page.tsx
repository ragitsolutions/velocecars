import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { LegalPage } from "@/components/layout/legal-page";
import { LEGAL_UPDATED, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Condiciones de uso",
  description: "Condiciones de uso del sitio web de Veloce Cars.",
  alternates: { canonical: "/condiciones-de-uso" },
};

/** Base: «Términos y condiciones» de la web actual (auditoría §11): objeto, uso, PI, responsabilidad, enlaces. */
export default function TermsPage() {
  return (
    <LegalPage title="Condiciones de uso" updated={LEGAL_UPDATED} current="/condiciones-de-uso">
      <h2>1. Objeto</h2>
      <p>
        Estas condiciones regulan el uso del sitio web de {site.name}, titularidad de{" "}
        {site.company.legalName}, cuyos datos figuran en el{" "}
        <Link href="/aviso-legal">aviso legal</Link>. El sitio web permite consultar el stock de
        vehículos, solicitar información, tasaciones y citas, y simular la financiación de un
        vehículo.
      </p>

      <h2>2. Uso del sitio web</h2>
      <p>
        Usted se compromete a hacer un uso adecuado y lícito del sitio web y de sus contenidos, a
        facilitar datos veraces en los formularios y a no emplearlos para enviar comunicaciones
        masivas, suplantar a terceros o dañar el funcionamiento de la web.
      </p>

      <h2>3. Naturaleza de la información</h2>
      <p>
        La información sobre vehículos, precios, equipamiento y financiación tiene carácter
        informativo y no constituye una oferta contractual. Las solicitudes enviadas a través de la
        web no suponen la reserva ni la compra de ningún vehículo: la operación se formaliza siempre
        mediante contrato por escrito.
      </p>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Queda prohibida la reproducción, distribución o transformación de los contenidos de la web
        (incluidas las fotografías de los vehículos) sin autorización expresa de su titular.
      </p>

      <h2>5. Enlaces externos</h2>
      <p>
        La web puede incluir enlaces a sitios de terceros (redes sociales, mapas, WhatsApp).{" "}
        {site.name} no controla esos sitios ni se responsabiliza de sus contenidos o de sus
        políticas de privacidad.
      </p>

      <h2>6. Responsabilidad</h2>
      <p>
        {site.name} procura que la web funcione correctamente y que la información sea exacta, pero
        no garantiza la ausencia de interrupciones o errores y no será responsable de los daños que
        pudieran derivarse de ellos, salvo en los casos previstos por la ley.
      </p>

      <h2>7. Modificaciones y legislación aplicable</h2>
      <p>
        Estas condiciones pueden actualizarse en cualquier momento; la versión vigente es la
        publicada en esta página. Se rigen por la legislación española.
      </p>
    </LegalPage>
  );
}
