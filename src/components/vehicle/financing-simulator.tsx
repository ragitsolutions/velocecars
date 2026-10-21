"use client";

import { useState } from "react";
import { RangeSlider } from "@/components/inventory/range-slider";
import { formatPrice } from "@/lib/utils/format";
import { FinancingCalculator } from "./financing-calculator";

/** Calculadora general (/financiacion): primero el precio del coche y después entrada y plazo. */
export function FinancingSimulator({ initialPrice, max }: { initialPrice: number; max: number }) {
  const [price, setPrice] = useState(initialPrice);
  return (
    <div className="flex flex-col gap-6">
      <div className="border border-line p-6 sm:p-8">
        <p className="mb-3 text-xs tracking-[0.18em] text-muted uppercase">Precio del vehículo</p>
        <RangeSlider
          label="Precio del vehículo"
          min={10_000}
          max={max}
          step={1000}
          value={[price]}
          format={formatPrice}
          onCommit={([v]) => setPrice(v!)}
        />
      </div>
      {/* `key`: al cambiar el precio la entrada vuelve a su valor por defecto (20 %). */}
      <FinancingCalculator key={price} price={price} />
    </div>
  );
}
