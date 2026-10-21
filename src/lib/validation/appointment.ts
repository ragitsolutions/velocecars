import { z } from "zod";
import { personFields } from "./contact";

export const APPOINTMENT_REASONS = {
  "ver-vehiculo": "Ver un vehículo",
  tasacion: "Tasación de mi coche",
  asesoramiento: "Asesoramiento",
  financiacion: "Financiación",
} as const;

/**
 * Franjas orientativas: la hora exacta se confirma después (no hay horario publicado,
 * ver pendiente B3 en docs/pendientes-cliente.md).
 */
export const APPOINTMENT_SLOTS = {
  manana: "Mañana",
  mediodia: "Mediodía",
  tarde: "Tarde",
} as const;

export const MAX_DAYS_AHEAD = 60;

/** Fecha local AAAA-MM-DD desplazada `days` días desde hoy. */
export function isoDate(days = 0, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const appointmentSchema = z
  .object({
    reason: z.enum(Object.keys(APPOINTMENT_REASONS) as [keyof typeof APPOINTMENT_REASONS]),
    vehicleId: z.string().max(64).optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha")
      .refine((d) => d >= isoDate(1) && d <= isoDate(MAX_DAYS_AHEAD), {
        error: `Elige una fecha entre mañana y los próximos ${MAX_DAYS_AHEAD} días`,
      }),
    slot: z.enum(Object.keys(APPOINTMENT_SLOTS) as [keyof typeof APPOINTMENT_SLOTS], {
      error: "Elige una franja",
    }),
    message: z.string().trim().max(1500).optional(),
    ...personFields,
  })
  .refine((d) => d.reason !== "ver-vehiculo" || !!d.vehicleId, {
    error: "Elige el vehículo que quieres ver",
    path: ["vehicleId"],
  });

export type AppointmentInput = z.infer<typeof appointmentSchema>;
