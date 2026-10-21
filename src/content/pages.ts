/**
 * Textos de las páginas interiores. Proceden de la web actual (docs/auditoria-web-actual.md
 * §6–§9, incluidos módulos que estaban desactivados), con erratas corregidas. Lo que la web
 * actual no dice se marca con PENDING() en lugar de inventarlo.
 */
import { PENDING } from "@/lib/site";

export type Faq = { question: string; answer: string };

/* ───────────────────────── Vendemos tu coche ───────────────────────── */

export const sellPage = {
  title: "Tasa y vende tu coche sin complicaciones",
  intro:
    "Consigue la mejor oferta del mercado. Nos encargamos de todo: tasación, preparación, publicación, compradores y trámites.",
  arguments: [
    {
      title: "Tasación en menos de 24 h",
      text: "Gratuita y sin compromiso. Online con los datos y fotos de tu coche, o presencial con cita previa.",
    },
    {
      title: "Gestión completa",
      text: "Revisión, reportaje audiovisual, estudio de mercado, anuncios, atención a compradores, contrato y transferencia.",
    },
    {
      title: "Tú decides cómo",
      text: "Sigue usando tu coche hasta que se venda o déjalo en nuestra exposición para darle más visibilidad.",
    },
  ],
  faqs: [
    {
      question: "¿Cómo puedo tasar mi coche con Veloce Cars?",
      answer:
        "Puedes solicitar la tasación online o de forma presencial. Solo necesitamos los datos básicos de tu vehículo —marca, modelo, año, kilometraje y estado— para ofrecerte una valoración profesional y ajustada al mercado.",
    },
    {
      question: "¿La tasación tiene algún coste o compromiso?",
      answer:
        "No. La tasación es gratuita y sin compromiso: conoces el valor real de tu coche sin obligación de venderlo.",
    },
    {
      question: "¿Qué documentación necesito para la tasación?",
      answer:
        "La ficha técnica, el permiso de circulación y, si es posible, el historial de mantenimiento. Si adjuntas fotos recientes, la valoración será más precisa.",
    },
    {
      question: "¿Cuánto tardo en recibir la tasación?",
      answer:
        "En la mayoría de los casos, en menos de 24 horas. Si lo prefieres, puedes venir a nuestras instalaciones para una tasación inmediata y presencial.",
    },
    {
      question: "¿Puedo entregar mi coche como parte del pago?",
      answer:
        "Sí. Podemos aceptar tu coche como parte del pago al adquirir otro vehículo de nuestro stock; lo valoramos caso a caso.",
    },
    {
      question: "¿Es necesario dejar el coche en depósito mientras se vende?",
      answer:
        "No es obligatorio. Dejarlo en nuestras instalaciones facilita visitas y revisiones y suele acelerar la venta, pero puedes seguir usándolo.",
    },
  ] satisfies Faq[],
};

/* ───────────────────────────── Servicios ───────────────────────────── */

export type ServiceItem = { title: string; text: string; tag?: string };

export const servicesPage = {
  title: "Asesoramiento personalizado",
  intro:
    "El principal objetivo de Veloce Cars es ofrecer un trato exclusivo y personalizado, adaptado a las necesidades de cada cliente.",
  groups: [
    {
      title: "Vender tu coche",
      items: [
        {
          title: "Gestión integral de venta",
          text: "Vendemos tu coche por ti, con o sin depósito en nuestra exposición. Tú solo recibes el pago.",
        },
        {
          title: "Tasación",
          text: "Gratuita y sin compromiso, online en menos de 24 horas o presencial con cita previa.",
        },
        {
          title: "Revisión del vehículo",
          text: "Revisamos el funcionamiento y estado del vehículo para transmitirlo con transparencia al futuro comprador.",
        },
        {
          title: "Reportaje audiovisual",
          text: "Fotografías y vídeos del vehículo para darle la mejor visibilidad.",
        },
        {
          title: "Estudio de mercado",
          text: "Comparamos modelos similares y evaluamos el estado del coche para fijar un precio competitivo y realista.",
        },
        {
          title: "Publicidad y anuncios",
          text: "Máxima visibilidad: nuestra cartera de clientes y las principales plataformas de venta.",
        },
        {
          title: "Atención a compradores",
          text: "Atendemos a cada interesado, enseñamos el coche y negociamos por ti.",
        },
      ],
    },
    {
      title: "Comprar con nosotros",
      items: [
        {
          title: "Garantía",
          text: "Vehículos con garantía y, en algunos casos, con la garantía oficial de la marca aún vigente.",
        },
        {
          title: "Trámites incluidos",
          text: "Contrato, transferencia de titularidad y verificación documental, sin que tengas que preocuparte de nada.",
        },
        {
          title: "Financiación",
          text: "Estudiamos la financiación de tu coche a plazos de 12 a 84 meses, con o sin entrada.",
        },
        {
          title: "Renting a medida",
          text: "Renting de cualquiera de los coches de nuestro stock, adaptado a ti.",
        },
        {
          title: "Tu coche como parte del pago",
          text: "Valoramos tu vehículo actual para que la operación sea más sencilla.",
        },
      ],
    },
    {
      title: "Asesoría",
      items: [
        {
          title: "Asesoría automovilística",
          text: "Orientación experta en compra, venta, importación, financiación, seguro y mantenimiento.",
        },
      ],
    },
  ] satisfies { title: string; items: ServiceItem[] }[],
  faqs: [
    {
      question: "¿En qué consiste el servicio de gestión de venta?",
      answer:
        "Nos encargamos de vender tu coche por ti: tasación profesional, preparación del vehículo, fotografías de calidad, publicación en portales, atención a compradores, negociación y gestión completa de la documentación.",
    },
    {
      question: "¿Cómo determináis el precio adecuado para vender mi coche?",
      answer:
        "Analizamos el mercado, comparamos modelos similares y evaluamos el estado del vehículo para fijar un precio competitivo y realista que acelere la venta sin perder valor.",
    },
    {
      question: "¿Qué ventajas tiene frente a vender por mi cuenta?",
      answer:
        "Ahorro de tiempo, mayor visibilidad, seguridad en el pago y asesoramiento profesional durante todo el proceso. Tú solo recibes el pago; nosotros nos ocupamos del resto.",
    },
    {
      question: "¿Qué incluye la asesoría automovilística?",
      answer:
        "Orientación experta en compra, venta, importación, financiación y mantenimiento, para que tomes decisiones informadas y optimices tu inversión.",
    },
    {
      question: "¿Qué trámites gestionáis cuando aparece un comprador?",
      answer:
        "Contratos, transferencia de titularidad, verificación documental y garantías legales, para que la venta se realice de forma segura y sin complicaciones.",
    },
  ] satisfies Faq[],
};

/* ──────────────────────────── Financiación ─────────────────────────── */

export const financingPage = {
  title: "Financiación a tu medida",
  intro:
    "Porque la vida da muchas vueltas, elige la financiación que mejor se adapta a ti: para particulares, autónomos y empresas.",
  modes: [
    {
      title: "Financiación convencional",
      text: "Revisamos tu documentación y te confirmamos en el mismo día si la financiación está aprobada.",
    },
    {
      title: "Financiación online",
      text: "Un asesor te guía paso a paso; te conectas a tu banca online y sabes al momento si está aprobada.",
    },
  ],
  documents: [
    "DNI o NIE en vigor",
    "Última nómina o justificante de pensión",
    "Recibo bancario reciente",
    "Autónomos y empresas: documentación adicional según la entidad",
  ],
  entityNote: PENDING("entidad financiera, TIN, TAE y comisiones reales"),
  faqs: [
    {
      question: "¿Puedo financiar cualquier coche del stock?",
      answer:
        "Sí, todos nuestros vehículos pueden financiarse, sujeto a la aprobación de la entidad.",
    },
    {
      question: "¿Qué plazos ofrecéis?",
      answer: "De 12 a 84 meses, para que ajustes la cuota a tus necesidades.",
    },
    {
      question: "¿Puedo financiar el 100 % del precio?",
      answer:
        "Sí, puedes financiar el importe completo o aportar una entrada para reducir la cuota.",
    },
    {
      question: "¿Cuánto tarda la aprobación?",
      answer:
        "Normalmente tienes respuesta en menos de 24 horas desde que recibimos la documentación.",
    },
  ] satisfies Faq[],
};

/* ───────────────────────────── Nosotros ────────────────────────────── */

export const aboutPage = {
  title: "Vendemos tu coche como si fuera el nuestro",
  intro:
    "Veloce Cars es una asesoría automovilística en Pozuelo de Alarcón (Madrid) especializada en la compraventa y la gestión de venta de vehículos premium y de alta gama.",
  story: [
    "Nos dedicamos principalmente a gestionar todo el proceso de venta y postventa de vehículos, cuidando cada detalle y a cada cliente.",
    "Entendemos la importancia de tu coche y nos aseguramos de transmitirla a su nuevo dueño. Por eso nos encargamos personalmente de cada operación: de la tasación y el reportaje al contrato, la transferencia y la garantía.",
  ],
  history: PENDING("historia de la empresa y año de fundación"),
  team: PENDING("equipo: nombres, cargos y fotos (con consentimiento)"),
  values: [
    { title: "Transparencia", text: "Cada coche, revisado y documentado antes de publicarse." },
    { title: "Trato personal", text: "Atendemos con cita previa, sin prisas y en exclusiva." },
    {
      title: "Cada detalle",
      text: "Del reportaje a la entrega de llaves, cuidamos todo el proceso.",
    },
    { title: "Como si fuera nuestro", text: "Transmitimos el valor de tu coche a su nuevo dueño." },
  ],
};

/* ───────────────────────────── Contacto ────────────────────────────── */

export const contactFaqs: Faq[] = [
  {
    question: "¿Cómo funciona la gestión de venta?",
    answer:
      "Tasamos tu coche, lo preparamos, lo fotografiamos y lo publicamos. Atendemos a los compradores y nos ocupamos del contrato y la transferencia.",
  },
  {
    question: "¿Los vehículos están revisados?",
    answer:
      "Sí. Todos nuestros vehículos se revisan antes de publicarse y se entregan con su historial y documentación en regla, con garantía.",
  },
  {
    question: "¿Cuál es vuestro horario?",
    answer:
      "Atendemos con cita previa para dedicarte el tiempo que necesites. Reserva tu cita en esta página, por teléfono o por WhatsApp.",
  },
  {
    question: "¿Ofrecéis asesoramiento en financiación y seguro?",
    answer:
      "Sí: te asesoramos en tasación, financiación y seguro, además de renting a medida de los coches del stock.",
  },
];
