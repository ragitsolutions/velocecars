import { isValidElement, type CSSProperties, type ReactNode } from "react";

/**
 * Titulares que nunca parten una palabra. La fuente display (Archivo Expanded, versalitas) es
 * muy ancha: «AVENTADOR» en una tarjeta de tres columnas o «RESOLVEMOS» en una columna estrecha
 * no cabían, y `overflow-wrap: break-word` los cortaba («AVENTADO / R»). Ahora el tamaño de letra
 * es `min(tamaño de diseño, ancho del contenedor ÷ ancho de la palabra más larga)`: si cabe, no
 * cambia nada; si no, se reduce lo justo. Se calcula en el servidor, sin JavaScript en el navegador.
 *
 * Uso: `<h2 className="fit [--size:var(--text-4xl)]" style={fitHeading(título)}>`. La clase
 * `.fit` (globals.css) aplica `min(var(--size), var(--fit))`; `--size` admite variantes
 * (`sm:[--size:…]`). Requiere un contenedor de consulta (`@container` de Tailwind) en un
 * ancestro: `100cqi` es su ancho de contenido. Sin él, `cqi` usa el ancho de la ventana.
 */

/**
 * Ancho de cada carácter en em (Archivo Expanded SemiBold, mayúsculas, letter-spacing 0,005em),
 * medido en el navegador. La suma sale ~2,5 % por encima del ancho real (sin kerning): margen.
 */
// prettier-ignore
const WIDTHS: Record<string, number> = {
  A: 0.913, B: 0.9, C: 0.951, D: 0.939, E: 0.871, F: 0.794, G: 1.018, H: 0.97, I: 0.351,
  J: 0.704, K: 0.912, L: 0.72, M: 1.117, N: 0.97, O: 1.023, P: 0.861, Q: 1.023, R: 0.925,
  S: 0.855, T: 0.819, U: 0.949, V: 0.869, W: 1.197, X: 0.919, Y: 0.866, Z: 0.839, Á: 0.913,
  É: 0.871, Í: 0.351, Ó: 1.023, Ú: 0.949, Ü: 0.949, Ñ: 0.97, Ç: 0.951, "0": 0.762, "1": 0.675,
  "2": 0.758, "3": 0.766, "4": 0.741, "5": 0.765, "6": 0.768, "7": 0.687, "8": 0.779, "9": 0.768,
  "-": 0.421, ".": 0.317, ",": 0.317, "'": 0.229, "’": 0.288, "&": 0.93, "/": 0.311, "¿": 0.686,
  "?": 0.686, "¡": 0.323, "!": 0.323, ":": 0.317, "+": 0.725, "(": 0.354, ")": 0.354, "«": 0.606,
  "»": 0.606, "\u00a0": 0.325, "€": 0.95, "%": 1.1,
};
/** Carácter no medido: tan ancho como la letra más ancha (W). */
const FALLBACK = 1.2;

/** Texto plano de un nodo de React (para titulares que llegan como `<span id>…</span>`). */
export function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/**
 * Ancho en em del fragmento más largo que no puede partirse: corta en espacios normales y tras
 * guion, pero no en el espacio irrompible (precios: «76.990 €» es una sola pieza).
 */
export function longestWordEm(text: string): number {
  const pieces = text.toUpperCase().match(/[^ \t\n\r-]+-?/g) ?? [];
  return Math.max(
    0,
    ...pieces.map((p) => [...p].reduce((sum, c) => sum + (WIDTHS[c] ?? FALLBACK), 0)),
  );
}

/** Variable `--fit`: el tamaño de letra máximo con el que la palabra más larga cabe entera. */
export function fitHeading(title: ReactNode): CSSProperties | undefined {
  const em = longestWordEm(textOf(title));
  if (!em) return undefined;
  return { "--fit": `calc(100cqi / ${em.toFixed(3)})` } as CSSProperties;
}
