import { z } from "zod";

/** Campos de persona y consentimientos comunes a todos los formularios (RGPD). */
export const personFields = {
  name: z.string().trim().min(2, "Indica tu nombre").max(80),
  lastName: z.string().trim().max(120).optional(),
  email: z.email("Introduce un email válido").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,19}$/, "Introduce un teléfono válido"),
  // La privacidad es obligatoria; las comunicaciones comerciales, opcionales y separadas.
  privacy: z.literal(true, { error: "Debes aceptar la política de privacidad" }),
  marketing: z.boolean(),
  /** Campo trampa (honeypot): invisible para personas; si llega relleno, es un bot. */
  website: z.string().max(500).optional(),
};

export const PREFERRED_CONTACT = {
  telefono: "Llamada",
  whatsapp: "WhatsApp",
  email: "Email",
} as const;

/** Formulario de contacto / interés en vehículo / preaprobación de financiación. */
export const contactSchema = z.object({
  topic: z.enum(["vehiculo", "general", "financiacion"]),
  vehicleId: z.string().max(64).optional(),
  vehicleName: z.string().max(200).optional(),
  ...personFields,
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(2000),
  preferredContact: z.enum(["telefono", "whatsapp", "email"]),
});

export type ContactInput = z.infer<typeof contactSchema>;
