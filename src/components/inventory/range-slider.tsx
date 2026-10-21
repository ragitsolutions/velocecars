"use client";

import * as Slider from "@radix-ui/react-slider";
import { useEffect, useState } from "react";

/**
 * Deslizador de rango (uno o dos tiradores) accesible con teclado (Radix). Mientras se
 * arrastra solo cambia el estado local; el filtro se aplica al soltar (`onCommit`).
 */
export function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  format,
  onCommit,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number[];
  format: (n: number) => string;
  onCommit: (value: number[]) => void;
}) {
  const [local, setLocal] = useState(value);
  const key = value.join("-");
  useEffect(() => setLocal(value), [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const names = local.length === 2 ? [`${label} mínimo`, `${label} máximo`] : [label];
  return (
    <div>
      <div className="tabular mb-3 flex justify-between text-xs text-muted">
        {local.length === 2 ? (
          <>
            <span>{format(local[0]!)}</span>
            <span>{format(local[1]!)}</span>
          </>
        ) : (
          <span>{format(local[0]!)}</span>
        )}
      </div>
      <Slider.Root
        min={min}
        max={max}
        step={step}
        value={local}
        onValueChange={setLocal}
        onValueCommit={onCommit}
        minStepsBetweenThumbs={1}
        className="relative flex h-6 touch-none items-center select-none"
      >
        <Slider.Track className="relative h-px grow bg-line-strong">
          <Slider.Range className="absolute h-full bg-accent" />
        </Slider.Track>
        {local.map((_, i) => (
          <Slider.Thumb
            key={i}
            aria-label={names[i]}
            className="block size-4 rounded-full border border-accent bg-bg shadow transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          />
        ))}
      </Slider.Root>
    </div>
  );
}
