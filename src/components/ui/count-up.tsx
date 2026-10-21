"use client";

import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/utils/format";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

/** Contador animado al entrar en pantalla. El valor final ya está en el HTML (SEO y sin JS). */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1.8,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const render = (v: number) =>
      (el.textContent = `${prefix}${formatNumber(Math.round(v))}${suffix}`);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          render(value * easeOut(t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      render(value);
    };
  }, [value, prefix, suffix, duration]);

  return (
    <span ref={ref} className="tabular">
      {prefix}
      {formatNumber(value)}
      {suffix}
    </span>
  );
}
