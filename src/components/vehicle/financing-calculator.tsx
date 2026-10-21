"use client";

import { useId, useState } from "react";
import { RangeSlider } from "@/components/inventory/range-slider";
import { WithPending } from "@/components/ui/pending";
import { defaultDownPayment, financing, monthlyPayment, taeFromTin } from "@/lib/financing";
import { formatPrice } from "@/lib/utils/format";

const TERMS = [12, 24, 36, 48, 60, 72, 84].filter(
  (m) => m >= financing.minMonths && m <= financing.maxMonths,
);

/**
 * Calculadora orientativa: entrada + plazo → cuota. Usa un TIN de EJEMPLO hasta que Veloce
 * facilite las condiciones reales (ver src/lib/financing.ts); el aviso legal lo deja claro.
 */
export function FinancingCalculator({ price }: { price: number }) {
  const id = useId();
  const [down, setDown] = useState(() => defaultDownPayment(price));
  const [months, setMonths] = useState<number>(financing.defaultMonths);
  const principal = Math.max(0, price - down);
  const monthly = monthlyPayment(principal, financing.exampleTin, months);
  const total = monthly * months;
  const tae = taeFromTin(financing.exampleTin);

  return (
    <div className="grid gap-10 border border-line p-6 sm:p-8 lg:grid-cols-2">
      <div className="space-y-8">
        <div>
          <p className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">Entrada</p>
          <RangeSlider
            label="Entrada"
            min={0}
            max={Math.round((price * 0.7) / 1000) * 1000}
            step={1000}
            value={[down]}
            format={formatPrice}
            onCommit={([v]) => setDown(v!)}
          />
        </div>
        <fieldset>
          <legend className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">Plazo</legend>
          <div className="flex flex-wrap gap-2">
            {TERMS.map((m) => (
              <label key={m} htmlFor={`${id}-${m}`} className="cursor-pointer">
                <input
                  id={`${id}-${m}`}
                  type="radio"
                  name={`${id}-plazo`}
                  value={m}
                  checked={months === m}
                  onChange={() => setMonths(m)}
                  className="peer sr-only"
                />
                <span className="tabular inline-block border border-line px-3 py-2 text-xs text-muted transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-inverse peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--focus-ring)] hover:text-fg">
                  {m} meses
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col justify-between gap-6 border-t border-line pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Cuota estimada</p>
          <p className="tabular mt-2 font-display text-5xl" aria-live="polite">
            {formatPrice(Math.round(monthly))}
            <span className="ml-1 font-sans text-base text-muted normal-case">/mes</span>
          </p>
          <dl className="tabular mt-6 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted">Importe financiado</dt>
            <dd className="text-right">{formatPrice(principal)}</dd>
            <dt className="text-muted">TIN de ejemplo</dt>
            <dd className="text-right">{financing.exampleTin.toFixed(2).replace(".", ",")} %</dd>
            <dt className="text-muted">TAE orientativa</dt>
            <dd className="text-right">{tae.toFixed(2).replace(".", ",")} %</dd>
            <dt className="text-muted">Importe total a plazos</dt>
            <dd className="text-right">{formatPrice(Math.round(total + down))}</dd>
          </dl>
        </div>
        <p className="text-xs leading-relaxed text-subtle">
          Simulación orientativa con un TIN de ejemplo, sin comisiones ni gastos. No constituye una
          oferta vinculante: las condiciones finales dependen de la entidad financiera y del estudio
          de tu solicitud. <WithPending text={financing.pendingNote} />
        </p>
      </div>
    </div>
  );
}
