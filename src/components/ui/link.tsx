import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * `next/link` sin precarga automática al entrar en pantalla: en el inventario hay decenas de
 * enlaces visibles y esas descargas competían con el primer pintado (Lighthouse las contaba
 * antes del LCP). La precarga se hace por intención —al pasar el ratón, enfocar o tocar el
 * enlace— desde components/motion/view-transitions.tsx. `prefetch` explícito sigue mandando.
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
