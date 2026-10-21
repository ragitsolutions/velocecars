# Sistema de diseño — «Lujo silencioso»

Fuente de verdad: [`src/styles/tokens.css`](../src/styles/tokens.css) (variables CSS) y su puente a Tailwind v4 en [`src/styles/globals.css`](../src/styles/globals.css) (`@theme inline`). Vista previa navegable: **`/guia-de-estilo`** (no indexada).

Dirección elegida por el cliente el 20/10/2026: **opción B «Automovilística»** (grotesk expandida en versalitas + acento platino). La alternativa A (Cormorant Garamond + oro champán `#C9A96E`) queda descartada.

## Principios

1. **Oscuro y cinematográfico.** Negros profundos, mucho aire, la foto del coche manda.
2. **Un solo acento metálico (platino)**, usado con mesura: antetítulos, segunda línea del titular, líneas finas, estados activos.
3. **Casi rectos.** Radios de 0–4 px; bordes finos de 1 px en vez de sombras.
4. **Cifras serias.** Precios, km y fichas técnicas con cifras tabulares y alineadas (`.tabular`).
5. **Movimiento lento y suave**: easing `cubic-bezier(0.22, 1, 0.36, 1)`, 0,6–1,2 s en entradas y 0,2–0,3 s en hovers. Con `prefers-reduced-motion` todo el movimiento no esencial se desactiva.

## Color

| Token            | Valor                   | Uso                             | Contraste sobre `--bg-primary`   |
| ---------------- | ----------------------- | ------------------------------- | -------------------------------- |
| `--bg-primary`   | `#0A0A0B`               | Fondo general                   | —                                |
| `--bg-secondary` | `#121214`               | Tarjetas, footer                | —                                |
| `--bg-elevated`  | `#1A1A1E`               | Modales, placeholders de imagen | —                                |
| `--text-primary` | `#F5F5F2`               | Texto principal                 | 18,1 : 1                         |
| `--text-muted`   | `#9A9A98`               | Texto secundario                | 7,0 : 1                          |
| `--text-subtle`  | `#84847E`               | Metadatos, notas legales        | 5,3 : 1 (4,6 : 1 sobre elevated) |
| `--accent`       | `#BFC3C9`               | Platino                         | 11,2 : 1                         |
| `--accent-hover` | `#E3E6EA`               | Hover / foco                    | 15,8 : 1                         |
| `--line`         | `rgba(255,255,255,.08)` | Divisores                       | —                                |

Todos los pares texto/fondo cumplen **WCAG 2.1 AA** (≥ 4,5 : 1). El texto sobre el acento usa `--text-inverse` (11,2 : 1).

Clases Tailwind: `bg-bg`, `bg-bg-secondary`, `bg-bg-elevated`, `text-fg`, `text-muted`, `text-subtle`, `text-accent`, `border-line`, `border-line-strong`…

## Tipografía

| Rol                                 | Familia                                             | Detalle                                                                                                                                                                                                              |
| ----------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titulares (h1–h4 y `.font-display`) | **Archivo Expanded SemiBold**, versalitas           | Instancia estática (anchura 125 %, peso 600) del variable de Google Fonts, recortada a latín: **11 KB** (el variable completo pesa 88 KB y retrasaba el LCP). Archivo: `src/styles/fonts/archivo-expanded-600.woff2` |
| Texto y UI (`font-sans`)            | **Manrope** variable (Google Fonts vía `next/font`) | Muy legible en tamaños pequeños; buenas cifras tabulares                                                                                                                                                             |

Toda la web usa **cifras alineadas** (`lining-nums`). El énfasis dentro de titulares se marca con color (`text-accent`), nunca con cursiva.

Regenerar la fuente de titulares (con fontTools):

```bash
fonttools varLib.instancer "Archivo[wdth,wght].ttf" wdth=125 wght=600 -o Archivo-Expanded-SemiBold.ttf
pyftsubset Archivo-Expanded-SemiBold.ttf --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215" --layout-features="kern,liga,lnum,tnum,case,cpsp" --flavor=woff2 --output-file=archivo-expanded-600.woff2
```

Escala fluida 375 → 1440 px con `clamp()`: `text-xs` (12–13 px) … `text-6xl` (38–92 px). La escala de titulares es ~25 % más contenida que con una serif, porque la grotesk expandida ocupa más ancho.

## Espaciado y layout

- Contenedor máx. **1440 px** (`.container-luxe`), margen lateral fluido `--gutter` (16–40 px).
- Secciones: `.section` → `padding-block` 72 px (móvil) → 160 px (escritorio).
- Rejilla de 12 columnas en escritorio. Numeración de secciones en la home «01 —— En venta» … «09 —— Contacto».

## Componentes

| Componente                | Archivo                                       | Notas                                                                                                            |
| ------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Button` / `ButtonLink`   | `components/ui/button.tsx`                    | `outline` (borde fino + barrido de relleno al hover), `solid`, `ghost`; `sm/md/lg`                               |
| `SectionHeading`          | `components/ui/section-heading.tsx`           | Numeración + antetítulo + titular + intro                                                                        |
| `Pending` / `WithPending` | `components/ui/pending.tsx`                   | Marcador visible `[[PENDIENTE: …]]`                                                                              |
| `CountUp`                 | `components/ui/count-up.tsx`                  | Contador animado; el valor final ya está en el HTML                                                              |
| `VehicleCard`             | `components/inventory/vehicle-card.tsx`       | Foto 4:3, distintivos, prestaciones al hover, cursor «Ver»                                                       |
| `Header` / `Footer`       | `components/layout/`                          | Cabecera transparente → sólida; megamenú; footer con crédito CC BY del modelo 3D                                 |
| `CookieBanner`            | `components/layout/cookie-banner.tsx`         | AEPD; se renderiza en el servidor (no retrasa el LCP) y un script en `<head>` lo oculta si ya hay consentimiento |
| Hero 3D                   | `components/home/hero/`, `components/three/`  | Ver «Hero» abajo                                                                                                 |
| Secciones de la home      | `components/home/*.tsx`                       | Textos editables en `src/content/home.ts`                                                                        |
| `PageHero`                | `components/layout/page-hero.tsx`             | Cabecera de páginas interiores: foto a sangre y velo; texto arriba en móvil (evita CLS), abajo desde tableta     |
| Formularios               | `components/forms/`                           | Línea inferior como campo, chips para opciones, consentimientos RGPD y capa de información básica (`form-parts`) |
| `ValuationForm`           | `components/forms/valuation-form.tsx`         | 3 pasos con barra de progreso, fotos con vista previa; progreso en `sessionStorage`                              |
| Galería / visor           | `components/vehicle/`                         | Mosaico + visor a pantalla completa (teclado, gestos, zoom, miniaturas); devuelve el foco al cerrar              |
| `FinancingCalculator`     | `components/vehicle/financing-calculator.tsx` | Entrada + plazo → cuota, TIN/TAE de ejemplo y aviso legal                                                        |
| `LegalPage`               | `components/layout/legal-page.tsx`            | Índice lateral + cuerpo `.legal-prose`                                                                           |

## Motion

| Pieza            | Implementación                                                                                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scroll suave     | Lenis (`components/motion/smooth-scroll.tsx`, con su propio bucle, cargado tras hidratar). Los contenedores con scroll propio llevan `data-lenis-prevent`                                                                                                                                 |
| Revelados        | `components/motion/reveal.tsx`: componentes de servidor con `data-reveal*`; transiciones en `globals.css` y observador en línea `src/lib/reveal-script.ts`. `Reveal` (fade-up), `RevealGroup`/`RevealItem` (cascada), `RevealText` (palabra a palabra), `RevealImage` (zoom-out 1,08 → 1) |
| Proceso          | Línea SVG que se dibuja con el scroll (`stroke-dashoffset`, listener pasivo + transición CSS) y pasos que se iluminan                                                                                                                                                                     |
| Marcas           | Cinta infinita en CSS; se pausa al pasar el ratón                                                                                                                                                                                                                                         |
| Cursor           | Punto + anillo; crece sobre enlaces y muestra «Ver» sobre tarjetas. Solo ratón; desactivable desde el pie (se recuerda)                                                                                                                                                                   |
| Cambio de página | Cortinilla de 500 ms en `app/template.tsx` (no en la primera carga)                                                                                                                                                                                                                       |
| WhatsApp         | Un pulso cada 10 s                                                                                                                                                                                                                                                                        |
| Tarjeta → ficha  | View Transitions API (`components/motion/view-transitions.tsx`): la foto de la tarjeta se transforma en la foto principal de la ficha                                                                                                                                                     |
| Resultados       | Al filtrar, las tarjetas se recolocan con `layout` y las que salen se desvanecen (`AnimatePresence`)                                                                                                                                                                                      |
| Reducido         | Revelados visibles sin animar, `motion-safe:`/`motion-reduce:` en CSS y comprobación de `prefers-reduced-motion` en los efectos con JavaScript                                                                                                                                            |
| Sin librerías    | Motion y GSAP se retiraron por rendimiento: CSS, Web Animations API (FLIP de resultados) y `requestAnimationFrame` (línea del proceso, contador)                                                                                                                                          |

## Hero

- **Escena 3D** (`components/three/car-scene.tsx`): coche girando (20 s por vuelta) en un estudio negro hecho con _lightformers_ (sin HDRI externo), cámara baja de teleobjetivo, suelo pulido con **reflejo por geometría espejada** (el reflector en tiempo real de Drei desplazaba el reflejo), sombra de oclusión bajo el coche y postprocesado en calidad alta: oclusión ambiental N8AO, bloom solo en faros, tono neutro Khronos PBR y viñeta. Acabados por material en `car-materials.ts`.
- **Carga diferida**: el póster (`/hero/poster-*.webp`, el mismo fotograma que la escena) es el LCP; Three.js se descarga al mover el ratón sobre la portada o con la portada a la vista y 6 s sin scroll (nunca al hacer scroll).
- **Modos** (`lib/device.ts`): `webgl`; `sequence` (36 fotogramas 360° controlados por scroll y arrastre) en dispositivos de gama baja, sin GPU real o con batería baja; `static` con movimiento reducido. Forzar con `?hero=webgl|sequence|static`.
- **Scroll**: el hero queda fijo (CSS `sticky`) 80 vh mientras la cámara se aleja y el texto se funde.
- Rendimiento medido (Lighthouse móvil, build de producción, 20/10/2026): **rendimiento 89–92**, CLS 0, TBT 80–140 ms, 596 KB en la primera carga. LCP simulado 3,1–3,7 s (observado 0,25 s): se ajusta en la Fase 5.

## Imágenes

- Fotos del cliente: estudio negro con suelo reflectante y matrícula «VELOCECARS», o exteriores en La Finca. En tarjetas se recortan a **4:3** con `object-cover` y degradado inferior para homogeneizar.
- `next/image` con AVIF/WebP y `sizes` ajustados en cada uso. El logotipo se sirve sin optimizar (el optimizador AVIF se bloquea con ese PNG con transparencia).

## Iconografía

Lucide, trazo 1,1–1,5 px. Sin emojis. Iconos de redes en SVG propio de trazo fino.

## Microcopy

Español de España. **Tú** en la web; **usted** en textos legales (pendiente D7).
