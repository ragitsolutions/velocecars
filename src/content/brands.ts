/**
 * Texto introductorio de las landings por marca (/vehiculos/[marca]). Propuesta para validar
 * por el cliente (pendiente D8): editar aquí; las marcas sin texto usan `defaultBrandIntro`.
 */
export const brandIntros: Record<string, string> = {
  porsche:
    "Del 911 al Cayenne o el Taycan: seleccionamos cada Porsche por su historial, su estado y su configuración. Te los enseñamos con calma, con cita previa, y nos ocupamos de la garantía y de todos los trámites.",
  ferrari:
    "Ferrari revisados y documentados, con su historial de mantenimiento. Te asesoramos en la compra y gestionamos la financiación, la transferencia y la garantía.",
  lamborghini:
    "Lamborghini seleccionados uno a uno. Ven a verlos con cita previa a nuestra exposición en Pozuelo de Alarcón; nosotros nos encargamos del resto.",
  bmw: "BMW de ocasión revisados y con garantía, de los SUV X a los M más deportivos. Financiación a medida y trámites incluidos.",
  "mercedes-benz":
    "Mercedes-Benz revisados y documentados, de berlinas a AMG y SUV. Te acompañamos en la elección, la financiación y la entrega.",
  audi: "Audi seleccionados por su estado e historial, con garantía y trámites incluidos. Pide información o reserva tu cita para verlos.",
};

export const defaultBrandIntro = (brand: string) =>
  `${brand} seleccionados y revisados, con garantía y todos los trámites incluidos. Pide información sobre cualquiera de ellos o reserva tu cita para verlos en Pozuelo de Alarcón.`;
