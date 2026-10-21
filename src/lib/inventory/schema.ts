import { z } from "zod";
import {
  BODY_TYPES,
  CONDITIONS,
  EMISSION_LABELS,
  FUELS,
  STATUSES,
  TRANSMISSIONS,
  type Vehicle,
} from "./types";

/** Validación en tiempo de carga de `data/vehicles.json` (lo edita el cliente a mano). */
const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
});

export const vehicleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "El slug solo admite minúsculas, números y guiones"),
  brand: z.string().min(1),
  brandSlug: z.string().regex(/^[a-z0-9-]+$/),
  model: z.string().min(1),
  version: z.string(),
  price: z.number().int().nonnegative(),
  priceOld: z.number().int().positive().optional(),
  priceNote: z.string().optional(),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  registrationDate: z.string().optional(),
  mileageKm: z.number().int().nonnegative(),
  powerCv: z.number().int().nonnegative(),
  powerKw: z.number().int().nonnegative().optional(),
  fuel: z.enum(FUELS),
  transmission: z.enum(TRANSMISSIONS),
  bodyType: z.enum(BODY_TYPES),
  condition: z.enum(CONDITIONS),
  color: z.string(),
  interiorColor: z.string().optional(),
  doors: z.number().int().positive().optional(),
  seats: z.number().int().positive().optional(),
  drivetrain: z.string().optional(),
  engine: z.string().optional(),
  consumption: z.string().optional(),
  emissions: z.string().optional(),
  emissionLabel: z.enum(EMISSION_LABELS).optional(),
  warrantyMonths: z.number().int().nonnegative().optional(),
  warrantyOfficial: z.boolean().optional(),
  owners: z.number().int().positive().optional(),
  vin: z.string().optional(),
  plate: z.string().optional(),
  topSpeedKmh: z.number().positive().optional(),
  acceleration0100: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  dimensionsMm: z.object({ length: z.number(), width: z.number(), height: z.number() }).optional(),
  highlights: z.array(z.string()),
  equipment: z.array(z.string()),
  description: z.string(),
  images: z.array(imageSchema).min(1, "Cada vehículo necesita al menos una foto"),
  video: z.string().optional(),
  status: z.enum(STATUSES),
  featured: z.boolean(),
  isNew: z.boolean(),
  financing: z
    .object({ monthlyFrom: z.number(), months: z.number().int(), apr: z.number() })
    .optional(),
  source: z.object({
    provider: z.enum(["dealcar", "json", "cms"]),
    externalId: z.string(),
    legacyUrl: z.string().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Vehicle>;

export const vehiclesFileSchema = z.array(vehicleSchema).superRefine((list, ctx) => {
  const seen = new Set<string>();
  list.forEach((v, i) => {
    const key = `${v.brandSlug}/${v.slug}`;
    if (seen.has(key)) {
      ctx.addIssue({ code: "custom", path: [i, "slug"], message: `Slug duplicado: ${key}` });
    }
    seen.add(key);
  });
});
