import Image from "next/image";
import Link from "@/components/ui/link";
import { cn } from "@/lib/utils/format";

/**
 * Wordmark del cliente. Se sirve una copia WebP de 480 px (≈ 8 KB; se muestra a ≤ 176 px CSS)
 * generada desde el PNG original de 1445 px (35 KB), que sigue en public/brand/. Sustituir por
 * SVG cuando llegue el vectorial (pendiente D4).
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label="Veloce Cars, ir al inicio" className={cn("inline-block", className)}>
      <Image
        src="/brand/logo-veloce-light.webp"
        alt="Veloce Cars"
        width={480}
        height={57}
        priority={priority}
        unoptimized
        className="h-auto w-full"
      />
    </Link>
  );
}
