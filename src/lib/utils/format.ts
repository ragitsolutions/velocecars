import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases y resuelve conflictos de Tailwind (la última gana: "inline-flex" + "hidden" → "hidden"). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// es-ES no agrupa los miles en números de 4 cifras («4500»); forzamos el punto siempre.
const numberFormatter = new Intl.NumberFormat("es-ES", {
  useGrouping: "always",
  maximumFractionDigits: 0,
});

/** «174.500 €» (espacio de no separación antes del símbolo). */
export const formatPrice = (value: number) => `${numberFormatter.format(value)} €`;
export const formatNumber = (value: number) => numberFormatter.format(value);
export const formatKm = (value: number) => `${formatNumber(value)} km`;
export const formatPower = (cv: number) => `${formatNumber(cv)} CV`;
