/**
 * Textos de la home. Proceden de la web actual (docs/auditoria-web-actual.md §3, §6, §7),
 * con erratas corregidas y algún ajuste de redacción. Editar aquí, no en los componentes.
 */

export const valueProposition = {
  eyebrow: "Asesoría automovilística",
  title: "Cuidamos cada detalle. Y a cada cliente.",
  intro:
    "Veloce Cars gestiona todo el proceso de venta y postventa de vehículos premium: desde la valoración inicial hasta la entrega de llaves, con un trato cercano y discreto.",
  pillars: [
    {
      title: "Revisado y documentado",
      text: "Cada coche se revisa antes de publicarse y se entrega con su historial y documentación en regla.",
    },
    {
      title: "Garantía",
      text: "Vehículos con garantía y, en algunos casos, con la garantía oficial de la marca aún vigente.",
    },
    {
      title: "Trámites incluidos",
      text: "Contrato, transferencia y cambio de titularidad: nos ocupamos de todo el papeleo.",
    },
    {
      title: "Cita previa",
      text: "Te atendemos en exclusiva, sin prisas, en Pozuelo de Alarcón.",
    },
  ],
};

export const services = [
  {
    icon: "search",
    title: "Revisión del vehículo",
    text: "Revisamos el funcionamiento y estado del vehículo para transmitirlo con transparencia al futuro comprador.",
  },
  {
    icon: "camera",
    title: "Reportaje audiovisual",
    text: "Fotografía y vídeo del vehículo para que luzca como merece en cada anuncio.",
  },
  {
    icon: "chart",
    title: "Estudio de mercado",
    text: "Analizamos modelos comparables para fijar un precio competitivo y realista.",
  },
  {
    icon: "megaphone",
    title: "Publicidad y anuncios",
    text: "Máxima visibilidad: nuestra cartera de clientes y las principales plataformas de venta.",
  },
  {
    icon: "handshake",
    title: "Atención al cliente",
    text: "Trato cercano y profesional con cada interesado, de la primera llamada a la firma.",
  },
  {
    icon: "shield",
    title: "Trámites y garantías",
    text: "Ejecutamos todos los trámites de transferencia y ofrecemos garantía en cada venta.",
  },
] as const;

export type ServiceIcon = (typeof services)[number]["icon"];

export const sellTeaser = {
  eyebrow: "Vendemos tu coche",
  title: "Deja tu coche en nuestras manos",
  text: "Confía en Veloce Cars para gestionar la venta de tu vehículo. Desde la valoración inicial hasta la entrega final, nos ocupamos de todo, con la posibilidad de dejar tu coche en nuestra exposición para maximizar su visibilidad y acelerar la venta.",
  quote:
    "Entendemos la importancia de tu coche y nos aseguramos de transmitirla a su nuevo dueño. Lo vendemos como si fuera el nuestro.",
};

export const processSteps = [
  {
    title: "Tasación",
    text: "Gratuita y sin compromiso. Online en menos de 24 horas o presencial con cita previa.",
  },
  {
    title: "Revisión y reportaje",
    text: "Revisamos el coche y lo fotografiamos para presentarlo en su mejor versión.",
  },
  {
    title: "Publicación y compradores",
    text: "Lo anunciamos donde importa y atendemos a cada interesado. Puedes seguir usándolo o dejarlo en exposición.",
  },
  {
    title: "Venta y trámites",
    text: "Contrato, transferencia y garantías. Tú solo recibes el pago.",
  },
];

export const faqs = [
  {
    question: "Quiero vender mi coche, ¿cómo trabajáis?",
    answer:
      "Nos encargamos de toda la gestión para la venta de tu vehículo con un trato exclusivo y personalizado. Contacta con nosotros sin compromiso y cuéntanos lo que necesitas.",
  },
  {
    question: "¿Los vehículos que tenéis en venta provienen de particulares?",
    answer:
      "Sí, nuestros vehículos provienen de clientes que quieren venderlos. Por eso llevamos a cabo todo el proceso de venta y postventa: cambio de nombre, transferencia y garantías.",
  },
  {
    question: "¿Aceptáis coche como forma de pago?",
    answer:
      "Principalmente ayudamos a nuestros clientes a vender sus vehículos, pero si llegamos a un buen acuerdo, sí, podemos valorarlo.",
  },
  {
    question: "¿Puedo seguir utilizando el coche hasta que se venda?",
    answer:
      "Por supuesto. Tienes dos opciones: seguir usando el vehículo hasta que se venda o dejarlo en nuestra exposición para darle más visibilidad.",
  },
  {
    question: "¿Ofrecéis renting?",
    answer: "Sí, ofrecemos renting a medida de todos los coches que tenemos en stock.",
  },
];
