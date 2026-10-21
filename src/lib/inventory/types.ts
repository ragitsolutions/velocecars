/**
 * Modelo de datos del inventario.
 *
 * Basado en la especificación del proyecto (§7.1) con estas ampliaciones, todas
 * opcionales salvo `brandSlug`, `highlights` y `source`:
 *  - `brandSlug`: segmento de URL de la marca (`/vehiculos/[marca]/[slug]`).
 *  - `bodyType` admite además 'Compacto' y 'Monovolumen' (existen en el stock real).
 *  - `emissionLabel` admite además 'B' (hay vehículos con etiqueta amarilla).
 *  - `highlights`: argumentos cortos («Nacional», «Único propietario»...).
 *  - `warrantyOfficial`: la garantía es la oficial de la marca.
 *  - `source`: origen del dato (DealCar) para sincronizar y generar redirecciones 301.
 */

export const FUELS = ["Gasolina", "Diésel", "Híbrido", "Híbrido enchufable", "Eléctrico"] as const;
export const TRANSMISSIONS = ["Automático", "Manual"] as const;
export const BODY_TYPES = [
  "Coupé",
  "Cabrio",
  "SUV",
  "Berlina",
  "Deportivo",
  "Todoterreno",
  "Familiar",
  "Compacto",
  "Monovolumen",
] as const;
export const CONDITIONS = ["Ocasión", "Km 0", "Nuevo", "Clásico"] as const;
export const EMISSION_LABELS = ["0", "ECO", "C", "B"] as const;
export const STATUSES = ["disponible", "reservado", "vendido"] as const;

export type Fuel = (typeof FUELS)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type BodyType = (typeof BODY_TYPES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type EmissionLabel = (typeof EMISSION_LABELS)[number];
export type VehicleStatus = (typeof STATUSES)[number];

export type VehicleImage = { src: string; alt: string; w: number; h: number };

export type VehicleFinancing = { monthlyFrom: number; months: number; apr: number };

export type VehicleSource = {
  provider: "dealcar" | "json" | "cms";
  /** Identificador en el sistema de origen (UUID de DealCar). */
  externalId: string;
  /** URL pública en la web anterior, para la redirección 301. */
  legacyUrl?: string;
};

export type Vehicle = {
  id: string;
  slug: string;
  brand: string;
  brandSlug: string;
  model: string;
  version: string;
  price: number;
  priceOld?: number;
  /** p. ej. "IVA incluido" o "Financiado desde". */
  priceNote?: string;
  year: number;
  month?: number;
  /** ISO 8601 (AAAA-MM-DD). */
  registrationDate?: string;
  mileageKm: number;
  powerCv: number;
  powerKw?: number;
  fuel: Fuel;
  transmission: Transmission;
  bodyType: BodyType;
  condition: Condition;
  color: string;
  interiorColor?: string;
  doors?: number;
  seats?: number;
  drivetrain?: string;
  engine?: string;
  consumption?: string;
  emissions?: string;
  emissionLabel?: EmissionLabel;
  warrantyMonths?: number;
  warrantyOfficial?: boolean;
  owners?: number;
  vin?: string;
  /** Se guarda pero no se publica salvo decisión del cliente (pendiente E6). */
  plate?: string;
  topSpeedKmh?: number;
  acceleration0100?: number;
  weightKg?: number;
  dimensionsMm?: { length: number; width: number; height: number };
  highlights: string[];
  equipment: string[];
  description: string;
  images: VehicleImage[];
  video?: string;
  status: VehicleStatus;
  featured: boolean;
  /** «Recién llegado». */
  isNew: boolean;
  financing?: VehicleFinancing;
  source: VehicleSource;
  createdAt: string;
  updatedAt: string;
};

export type SortKey =
  | "destacados"
  | "precio-asc"
  | "precio-desc"
  | "km-asc"
  | "anio-desc"
  | "potencia-desc"
  | "recientes";

export type InventoryFilters = {
  brands?: string[];
  models?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  kmMax?: number;
  powerMin?: number;
  fuels?: Fuel[];
  transmissions?: Transmission[];
  bodyTypes?: BodyType[];
  conditions?: Condition[];
  colors?: string[];
  statuses?: VehicleStatus[];
  q?: string;
};

export type InventoryQuery = InventoryFilters & {
  sort?: SortKey;
  page?: number;
  pageSize?: number;
};

export type InventoryResult = {
  items: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type BrandSummary = { name: string; slug: string; count: number; models: string[] };

/**
 * Contrato que debe cumplir cualquier fuente de inventario (JSON local, CMS,
 * feed de portal...). Las páginas solo dependen de esta interfaz.
 */
export interface InventoryProvider {
  readonly name: string;
  getAll(): Promise<Vehicle[]>;
  getBySlug(brandSlug: string, slug: string): Promise<Vehicle | null>;
  getById(id: string): Promise<Vehicle | null>;
}
