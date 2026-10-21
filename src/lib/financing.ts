import { PENDING } from "./site";

/**
 * Parámetros de la calculadora de financiación. **Valores de ejemplo**: Veloce no ha facilitado
 * todavía entidad, TIN ni comisiones (pendiente A5 en docs/pendientes-cliente.md). Los plazos
 * (12–84 meses) sí proceden de las preguntas frecuentes de su web actual.
 */
export const financing = {
  exampleTin: 8.99, // % anual · EJEMPLO, sustituir por el TIN real de la entidad
  minMonths: 12,
  maxMonths: 84,
  defaultMonths: 60,
  defaultDownPaymentPct: 20,
  pendingNote: PENDING("condiciones reales de financiación (entidad, TIN, TAE y comisiones)"),
} as const;

/** Cuota mensual de un préstamo francés (sin comisiones). */
export function monthlyPayment(principal: number, annualTin: number, months: number) {
  if (principal <= 0) return 0;
  const r = annualTin / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** TAE orientativa equivalente al TIN con capitalización mensual (sin comisiones ni gastos). */
export const taeFromTin = (annualTin: number) => (Math.pow(1 + annualTin / 100 / 12, 12) - 1) * 100;

/** Entrada por defecto (redondeada a miles), la misma con la que arranca la calculadora. */
export const defaultDownPayment = (price: number) =>
  Math.round((price * financing.defaultDownPaymentPct) / 100 / 1000) * 1000;

export function estimateFor(price: number) {
  const downPayment = defaultDownPayment(price);
  return {
    monthly: monthlyPayment(price - downPayment, financing.exampleTin, financing.defaultMonths),
    months: financing.defaultMonths,
    downPayment,
  };
}
