# Veloce Cars

Web de [Veloce Cars](https://www.velocecars.es): vehículos premium y de lujo y gestión de venta
en Pozuelo de Alarcón (Madrid). Sustituye a la web actual alojada en DealCar.

Next.js 15 (App Router, RSC) · TypeScript estricto · Tailwind CSS v4 · CSS + Web Animations + Lenis ·
React Hook Form + Zod · Resend · Playwright.

## Requisitos

- Node.js ≥ 20.9 (desarrollado con Node 24; la imagen Docker usa Node 22)
- npm 10+

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # ajusta las variables
npm run dev                  # http://localhost:3000
```

La guía de estilo navegable está en `/guia-de-estilo`.

## Scripts

| Script                        | Qué hace                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Servidor de desarrollo                                                                                   |
| `npm run build` / `npm start` | Build y servidor de producción                                                                           |
| `npm run lint`                | ESLint + comprobación de tipos                                                                           |
| `npm run format`              | Prettier                                                                                                 |
| `npm run test:e2e`            | Playwright: rutas, inventario, ficha, formularios, accesibilidad (axe) y teclado (antes `npm run build`) |
| `npm run lhci`                | Lighthouse CI con los umbrales del proyecto (antes `npm run build`)                                      |
| `npm run inventory:import`    | Regenera `data/vehicles.json` desde DealCar (`-- --live` para descargar el stock publicado)              |
| `npm run inventory:validate`  | Valida `data/vehicles.json` con el esquema de la web                                                     |
| `npm run inventory:images`    | Descarga las fotos de los vehículos a `public/vehicles/` (WebP ≤ 1920 px)                                |
| `npm run 3d:model`            | Prepara el modelo 3D del hero (`public/models/car.glb`)                                                  |
| `npm run 3d:render`           | Renderiza los pósteres y el vídeo del giro del hero desde la escena 3D (necesita Chrome instalado)       |

## Qué incluye

- **Portada** centrada en el stock: hero con el coche girando (vídeo renderizado desde una escena 3D, ~0,87 MB, con póster), buscador, stock destacado, vender tu coche, servicios, preguntas frecuentes y contacto.
- **Inventario** (`/vehiculos`, `/vehiculos/[marca]`): filtros en la URL, orden, vista rejilla/lista, paginación, favoritos, comparador de hasta 3 coches.
- **Ficha** (`/vehiculos/[marca]/[slug]`): galería con visor a pantalla completa, ficha técnica, equipamiento por categorías, garantía, calculadora de financiación, formulario precargado, similares, impresión, JSON-LD `Car` + `Offer`.
- **Páginas**: vender tu coche (tasación en 3 pasos con fotos), servicios, financiación (calculadora + estudio), nosotros, contacto con cita previa y mapa con consentimiento, textos legales y 404 con buscador.
- **Legal y calidad**: banner de cookies AEPD, consentimientos RGPD separados, WCAG 2.1 AA (axe sin infracciones), sitemap, 301 desde las URL antiguas.

## Documentación

- [`docs/manual-cliente.md`](docs/manual-cliente.md): stock, textos, formularios, coche 3D y pendientes.
- [`docs/despliegue.md`](docs/despliegue.md): Vercel y VPS con Docker, variables, comprobaciones y rendimiento.
- [`docs/pendientes-cliente.md`](docs/pendientes-cliente.md): datos que faltan (marcados `[[PENDIENTE]]` en la web).
- [`docs/auditoria-web-actual.md`](docs/auditoria-web-actual.md): auditoría de la web anterior.
- [`docs/design-system.md`](docs/design-system.md): sistema de diseño.
- [`docs/licencias-assets.md`](docs/licencias-assets.md): origen y licencia de cada recurso.
