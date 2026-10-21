import { z } from "zod";
import { FUELS, TRANSMISSIONS } from "@/lib/inventory/types";
import { personFields } from "./contact";

const currentYear = new Date().getFullYear();

export const VEHICLE_CONDITIONS = [
  "Como nuevo",
  "Muy bueno",
  "Bueno",
  "Necesita reparaciones",
] as const;
export const MAX_PHOTOS = 10;
/** Tamaño máximo por foto tras la compresión en el navegador. */
export const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;
/** Total de fotos por envío: Vercel limita el cuerpo de la petición a 4,5 MB. */
export const MAX_PHOTOS_TOTAL_BYTES = 4 * 1024 * 1024;

/** Paso 1 — el vehículo. */
export const valuationVehicleSchema = z.object({
  vehicleType: z.enum(["turismo", "industrial"]),
  plate: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^$|^[0-9]{4}\s?[A-Z]{3}$|^[A-Z]{1,2}\s?[0-9]{4}\s?[A-Z]{0,2}$/, "Matrícula no válida")
    .optional(),
  brand: z.string().trim().min(2, "Indica la marca").max(60),
  model: z.string().trim().min(1, "Indica el modelo").max(80),
  version: z.string().trim().max(120).optional(),
  year: z.coerce
    .number({ error: "Indica el año" })
    .int()
    .min(1950, "Año no válido")
    .max(currentYear + 1, "Año no válido"),
});

/** Paso 2 — estado y uso. */
export const valuationStateSchema = z.object({
  mileageKm: z.coerce.number({ error: "Indica los kilómetros" }).int().min(0).max(2_000_000),
  fuel: z.enum(FUELS, { error: "Elige el combustible" }),
  transmission: z.enum(TRANSMISSIONS, { error: "Elige el cambio" }),
  color: z.string().trim().max(40).optional(),
  condition: z.enum(VEHICLE_CONDITIONS, { error: "Elige el estado" }),
  notes: z.string().trim().max(1500).optional(),
});

/** Paso 3 — contacto y consentimiento. */
export const valuationContactSchema = z.object(personFields);

export const valuationSchema = valuationVehicleSchema
  .extend(valuationStateSchema.shape)
  .extend(valuationContactSchema.shape);

export type ValuationInput = z.input<typeof valuationSchema>;
export type ValuationData = z.output<typeof valuationSchema>;

export const VALUATION_STEPS = [
  { title: "Vehículo", schema: valuationVehicleSchema },
  { title: "Estado y fotos", schema: valuationStateSchema },
  { title: "Tus datos", schema: valuationContactSchema },
] as const;
