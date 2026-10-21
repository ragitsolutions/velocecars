import type { EmissionLabel } from "@/lib/inventory/types";
import { cn } from "@/lib/utils/format";

/** Colores oficiales aproximados de los distintivos ambientales de la DGT. */
const STYLES: Record<EmissionLabel, { className: string; title: string }> = {
  "0": { className: "bg-[#1f6fb2] text-white", title: "Cero emisiones" },
  ECO: {
    className: "bg-[linear-gradient(90deg,#1f6fb2_50%,#3aa856_50%)] text-white",
    title: "ECO",
  },
  C: { className: "bg-[#3aa856] text-white", title: "C" },
  B: { className: "bg-[#f2c230] text-black", title: "B" },
};

export function EmissionBadge({ label, className }: { label: EmissionLabel; className?: string }) {
  const s = STYLES[label];
  return (
    <span
      className={cn(
        "inline-grid size-10 place-items-center rounded-full font-sans text-[0.6875rem] font-bold tracking-wide",
        s.className,
        className,
      )}
      title={`Distintivo ambiental DGT: ${s.title}`}
    >
      <span className="sr-only">Distintivo ambiental DGT </span>
      {label}
    </span>
  );
}
