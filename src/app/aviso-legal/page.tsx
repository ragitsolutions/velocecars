import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { LegalPage } from "@/components/layout/legal-page";
import { WithPending } from "@/components/ui/pending";
import { LEGAL_UPDATED, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Datos identificativos del titular del sitio web de Veloce Cars (LSSI-CE).",
  alternates: { canonical: "/aviso-legal" },
};

/** Base: aviso legal de la web actual (auditoría §11), completado con lo que exige el art. 10 LSSI-CE. */
export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso legal" updated={LEGAL_UPDATED} current="/aviso-legal">
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los datos del
        titular de este sitio web:
      </p>
      <ul>
        <li>
          <strong>Nombre comercial:</strong> {site.name}
        </li>
        <li>
          <strong>Titular:</strong> {site.company.legalName}
        </li>
        <li>
          <strong>CIF:</strong> {site.company.taxId}
        </li>
        <li>
          <strong>Domicilio:</strong> {site.address.street}, {site.address.postalCode}{" "}
          {site.address.city} ({site.address.region})
        </li>
        <li>
          <strong>Datos registrales:</strong> <WithPending text={site.company.registry} />
        </li>
        <li>
          <strong>Correo electrónico:</strong>{" "}
          <a href={`mailto:${site.contact.privacyEmail}`}>{site.contact.privacyEmail}</a>
        </li>
        <li>
          <strong>Teléfono:</strong> {site.contact.phoneAlt.display}
        </li>
      </ul>

      <h2>2. Objeto y aceptación</h2>
      <p>
        Este aviso legal regula el acceso y el uso del sitio web{" "}
        {site.url.replace(/^https?:\/\//, "")}. El acceso y uso del sitio web implica la aceptación
        plena y sin reservas del presente aviso legal y de las{" "}
        <Link href="/condiciones-de-uso">condiciones de uso</Link>.
      </p>

      <h2>3. Información sobre los vehículos</h2>
      <p>
        Las características, el equipamiento, las fotografías y los precios de los vehículos se
        publican con la mayor exactitud posible, pero tienen carácter informativo y pueden contener
        errores o variar sin previo aviso. Los precios se indican en euros e incluyen los impuestos
        aplicables salvo que se indique lo contrario. La disponibilidad de cada vehículo y las
        condiciones definitivas de la operación se confirman siempre por escrito antes de la
        compraventa.
      </p>
      <p>
        Las simulaciones de financiación son orientativas, no constituyen una oferta vinculante y
        están sujetas a la aprobación de la entidad financiera.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Los contenidos del sitio web (textos, fotografías, diseño, logotipos y código) son
        titularidad de {site.company.legalName} o de terceros que han autorizado su uso, y están
        protegidos por la normativa de propiedad intelectual e industrial. Las marcas y nombres de
        los fabricantes de vehículos pertenecen a sus respectivos titulares y se citan únicamente
        para identificar los vehículos ofertados. Los créditos de los recursos de terceros figuran
        en el pie de página.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        {site.company.legalName} no se responsabiliza de los daños derivados de interrupciones,
        errores técnicos o virus ajenos a su control, ni del contenido de los sitios web de terceros
        a los que se pueda acceder mediante enlaces.
      </p>

      <h2>6. Protección de datos y cookies</h2>
      <p>
        El tratamiento de los datos personales se rige por la{" "}
        <Link href="/politica-privacidad">política de privacidad</Link> y el uso de cookies por la{" "}
        <Link href="/politica-cookies">política de cookies</Link>.
      </p>

      <h2>7. Legislación aplicable</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier controversia, las
        partes se someten a los juzgados y tribunales que correspondan conforme a la normativa
        vigente; si la persona usuaria tiene la condición de consumidora, los de su domicilio.
      </p>
    </LegalPage>
  );
}
