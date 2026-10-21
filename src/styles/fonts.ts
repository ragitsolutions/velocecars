import { Manrope } from "next/font/google";
import localFont from "next/font/local";

/**
 * Titulares: Archivo en su corte Expanded (anchura 125 %) SemiBold, en versalitas: grotesk
 * expandida de carácter automovilístico (opción B, elegida por el cliente el 20/10/2026).
 *
 * Es una instancia estática del variable de Google Fonts (OFL, ver fonts/OFL-Archivo.txt),
 * recortada a latín: 11 KB frente a los 88 KB del variable completo, lo que adelanta el LCP.
 * Regenerar: fontTools `varLib.instancer Archivo[wdth,wght].ttf wdth=125 wght=600` + `pyftsubset`
 * (comandos en docs/design-system.md).
 */
export const display = localFont({
  src: "./fonts/archivo-expanded-600.woff2",
  weight: "600",
  style: "normal",
  // «swap» (no «optional»: con él los titulares acababan a menudo en la fuente de reserva).
  display: "swap",
  variable: "--font-archivo",
  declarations: [{ prop: "font-stretch", value: "125%" }],
  adjustFontFallback: "Arial",
});

/** Cuerpo: Manrope, sans geométrica muy legible en tamaños pequeños y cifras tabulares. */
export const sans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});
