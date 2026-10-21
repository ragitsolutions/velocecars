import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { LegalPage } from "@/components/layout/legal-page";
import { WithPending } from "@/components/ui/pending";
import { LEGAL_UPDATED, PENDING, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo trata Veloce Cars sus datos personales (RGPD y LOPDGDD).",
  alternates: { canonical: "/politica-privacidad" },
};

/**
 * Base: política de la web actual (auditoría §11) adaptada a los tratamientos reales de la
 * nueva web: formularios de contacto, cita y tasación, analítica con consentimiento y mapa.
 */
export default function PrivacyPolicyPage() {
  const email = site.contact.privacyEmail;
  return (
    <LegalPage
      title="Política de privacidad"
      updated={LEGAL_UPDATED}
      current="/politica-privacidad"
    >
      <p>
        En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y de la Ley Orgánica 3/2018 de
        Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), le informamos
        sobre el tratamiento de sus datos personales.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Titular:</strong> {site.company.legalName} ({site.name})
        </li>
        <li>
          <strong>CIF:</strong> {site.company.taxId}
        </li>
        <li>
          <strong>Domicilio:</strong> {site.address.street}, {site.address.postalCode}{" "}
          {site.address.city} ({site.address.region})
        </li>
        <li>
          <strong>Contacto para protección de datos:</strong>{" "}
          <a href={`mailto:${email}`}>{email}</a>
        </li>
      </ul>

      <h2>2. Qué datos tratamos y para qué</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Tratamiento</th>
            <th scope="col">Datos</th>
            <th scope="col">Finalidad</th>
            <th scope="col">Base jurídica</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Formulario de contacto e interés en vehículos</td>
            <td>Nombre, apellidos, email, teléfono, mensaje y vehículo consultado</td>
            <td>Responder a su consulta y, en su caso, preparar la compraventa</td>
            <td>Consentimiento (art. 6.1.a RGPD) y medidas precontractuales (art. 6.1.b)</td>
          </tr>
          <tr>
            <td>Cita previa</td>
            <td>Los anteriores, fecha, franja y motivo de la visita</td>
            <td>Gestionar y confirmar su cita</td>
            <td>Consentimiento y medidas precontractuales</td>
          </tr>
          <tr>
            <td>Tasación de vehículos</td>
            <td>
              Datos de contacto, datos del vehículo (incluida la matrícula si la indica) y
              fotografías
            </td>
            <td>Valorar su vehículo y gestionar, en su caso, su venta</td>
            <td>Consentimiento y medidas precontractuales</td>
          </tr>
          <tr>
            <td>Comunicaciones comerciales</td>
            <td>Nombre, email y teléfono</td>
            <td>Enviarle novedades del stock y ofertas por email o WhatsApp</td>
            <td>Consentimiento específico, independiente y revocable</td>
          </tr>
          <tr>
            <td>Relación comercial</td>
            <td>Datos identificativos, fiscales y del vehículo</td>
            <td>Compraventa, gestión de venta, garantía, trámites y facturación</td>
            <td>Ejecución del contrato (art. 6.1.b) y obligaciones legales (art. 6.1.c)</td>
          </tr>
          <tr>
            <td>Analítica web</td>
            <td>Datos de navegación seudonimizados</td>
            <td>Conocer el uso de la web para mejorarla</td>
            <td>
              Consentimiento a través del <Link href="/politica-cookies">panel de cookies</Link>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Los campos marcados como obligatorios son necesarios para atender su solicitud. Las
        fotografías que adjunte en la tasación deben ser de su vehículo; le rogamos que evite que
        aparezcan personas o matrículas de terceros.
      </p>

      <h2>3. Conservación</h2>
      <p>
        Los datos de las consultas que no deriven en una relación comercial se conservan durante el
        tiempo necesario para atenderlas y, como máximo, un año. Los datos de clientes se conservan
        mientras dure la relación y, después, durante los plazos de prescripción de las obligaciones
        legales (mercantiles y fiscales). Los datos para comunicaciones comerciales se conservan
        hasta que retire su consentimiento.{" "}
        <WithPending text={PENDING("confirmar plazos de conservación")} />
      </p>

      <h2>4. Destinatarios</h2>
      <p>
        No cedemos sus datos a terceros salvo obligación legal (por ejemplo, Administración
        tributaria o Dirección General de Tráfico para la transferencia del vehículo) o cuando sea
        necesario para la operación que usted solicita (por ejemplo, la entidad financiera si pide
        financiación, con su conocimiento previo).
      </p>
      <p>Tratan datos por cuenta de {site.name}, como encargados del tratamiento:</p>
      <ul>
        <li>Proveedor de alojamiento de la web (Vercel Inc.).</li>
        <li>Proveedor de envío de correo electrónico de los formularios (Resend).</li>
        <li>Gestoría para trámites administrativos y fiscales.</li>
        <li>Google (Google Tag Manager / Analytics y Google Maps), solo si usted lo consiente.</li>
        <li>
          <WithPending
            text={PENDING("lista definitiva de encargados (CRM, n8n, proveedor del inventario)")}
          />
        </li>
      </ul>

      <h2>5. Transferencias internacionales</h2>
      <p>
        Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo
        (Estados Unidos). En esos casos, las transferencias se amparan en el Marco de Privacidad de
        Datos UE-EE. UU. o en cláusulas contractuales tipo aprobadas por la Comisión Europea.
      </p>

      <h2>6. Sus derechos</h2>
      <p>
        Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación del
        tratamiento y portabilidad, así como retirar en cualquier momento el consentimiento
        prestado, escribiendo a <a href={`mailto:${email}`}>{email}</a> o por correo postal a la
        dirección indicada, acompañando una copia de su documento identificativo. Para darse de baja
        de las comunicaciones comerciales basta con indicarlo en respuesta a cualquiera de ellas.
      </p>
      <p>
        Si considera que no hemos atendido correctamente sus derechos, puede presentar una
        reclamación ante la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
          www.aepd.es
        </a>
        ).
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas adecuadas para proteger sus datos: conexión
        cifrada (HTTPS), acceso restringido y proveedores que ofrecen garantías suficientes.
      </p>
    </LegalPage>
  );
}
