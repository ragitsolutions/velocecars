import type { Vehicle } from "./types";

export const vehicleHref = (v: Pick<Vehicle, "brandSlug" | "slug">) =>
  `/vehiculos/${v.brandSlug}/${v.slug}`;

/** Nombre para la View Transition tarjeta → ficha (la foto «vuela» a la galería). */
export const vehicleTransitionName = (id: string) => `vehiculo-${id.slice(0, 8)}`;
