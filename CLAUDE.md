# Veloce Cars — web

Nueva web de Veloce Cars (vehículos premium y gestión de venta, Pozuelo de Alarcón) que sustituye a la actual en DealCar. Construido por fases (0–6, todas completadas el 20/10/2026; pendiente de revisión del cliente). Para cambios grandes, pedir confirmación antes de darlos por cerrados.

## Antes de tocar nada

- `docs/auditoria-web-actual.md`: qué tiene la web actual (todo debe existir en la nueva, y mejor).
- `docs/pendientes-cliente.md`: datos que faltan. **Nunca inventar** datos legales, teléfonos, horarios, condiciones de financiación o garantía: usar `[[PENDIENTE: …]]` (`<Pending>` / `WithPending`, `PENDING()` en `src/lib/site.ts`).
- `docs/design-system.md`: tokens y componentes. Colores y tamaños siempre vía tokens (`bg-bg`, `text-muted`, `text-accent`…), nunca hex sueltos en componentes.

## Comandos

```bash
npm run dev                # localhost:3000
npm run lint               # eslint + tsc (debe quedar limpio)
npm run build
npm run test:e2e           # Playwright sobre la build (puerto 3100); requiere `npm run build` antes
npm run lhci               # Lighthouse CI con los umbrales del proyecto (lighthouserc.cjs)
npm run inventory:validate # valida data/vehicles.json con el esquema Zod
npm run inventory:import   # DealCar → data/vehicles.json (+ data/legacy-redirects.json); --live para descargar
npm run inventory:images   # copias locales WebP en public/vehicles (no versionadas)
npm run 3d:model           # prepara public/models/car.glb (licencia y logos: ver docs/licencias-assets.md)
npm run 3d:render          # renderiza póster y vídeo del giro del hero desde la escena (GPU, Chrome)
```

Antes de dar una fase por cerrada: `npm run lint`, `npm run build` y `npm run test:e2e` sin errores, y sin errores de consola ni de hidratación.

## Arquitectura

- Next.js 15 App Router + RSC, TypeScript estricto (`noUncheckedIndexedAccess`), Tailwind v4 (`@theme inline` en `src/styles/globals.css`).
- Inventario: `src/lib/inventory/` — tipos (`types.ts`), validación Zod (`schema.ts`), funciones puras de filtro/orden (`query.ts`), proveedores (`providers/json-provider.ts` lee `data/vehicles.json` con fs; `cms-provider.ts` es un stub). Las páginas solo usan `src/lib/inventory/index.ts`.
- `data/vehicles.json` se **genera** con `scripts/dealcar/import-stock.mjs`; si se edita a mano, respetar el esquema (se valida al cargar). El año es el de matriculación (el `year` de DealCar es el de catálogo).
- Rutas de vehículo: `/vehiculos/[marca]/[slug]`, slug = modelo-versión-año-6 primeros caracteres del UUID (estable). ISR 1 h.
- Redirecciones 301 de la web anterior en `next.config.ts` (usa `data/legacy-redirects.json`).
- Cookies: `src/lib/consent.ts` + `components/layout/consent-provider.tsx`. GTM solo se inyecta con consentimiento analítico y `NEXT_PUBLIC_GTM_ID`.
- `cn()` (`src/lib/utils/format.ts`) usa tailwind-merge: la clase pasada por props gana a la base.

## Hero 3D y motion (Fase 2)

- **El hero es un vídeo** (`public/hero/spin-{landscape,portrait}.mp4`, ~0,87 MB, una vuelta en bucle) renderizado desde la escena 3D; la web **no carga Three.js**. Antes la escena corría en el navegador (~2,5 MB y compilación de shaders): el giro tardaba en arrancar y en algunos móviles no llegaba a moverse. `hero-stage.tsx` pinta el póster (LCP) y, tras la carga, el vídeo con fundido; se pausa fuera de pantalla; con movimiento reducido o ahorro de datos solo el póster (`src/lib/device.ts`, forzar con `?hero=video|static`).
- Escena (solo para renderizar): `src/components/three/car-scene.tsx` + acabados por material en `car-materials.ts`, servida en `/render/turntable` con `RENDER_TOOLS=1`.
- El póster `/hero/poster-*.webp` es el primer fotograma del vídeo: el relevo no se nota.
- Tras cambiar modelo, materiales, luces o cámara: `npm run 3d:render` (con `RENDER_TOOLS=1 npm run dev` o `next start` en marcha) para regenerar pósteres, vídeos y `hero-assets.ts`. Codifica H.264 con WebCodecs en el Chrome instalado (Chromium no codifica H.264) y calidad constante `--avc-q 32`. VP9/WebM se descartó: el codificador del navegador pesaba 4–6 MB con calidad constante y emborronaba el primer fotograma con bitrate. Cambiar el coche: `npm run 3d:model -- --source mi-coche.glb`.
- El componente de scroll suave (Lenis) y el cursor solo se cargan con ratón (`deferred-extras.tsx`); en táctil no aportan y el bucle de Lenis gastaba CPU. Su efecto «volver arriba al cambiar de página» no debe actuar al montarse: Lenis llega en diferido y devolvía arriba a quien ya había bajado.
- El **crédito CC BY 4.0 del modelo** está en el footer: no quitarlo mientras se use «Car Concept».
- Lecciones: el reflector de Drei desplaza el reflejo (se usa geometría espejada bajo un suelo semitransparente); en ángulo rasante cualquier suelo con brillo especular se ve gris (suelo Lambert); el tono AgX levanta los negros (se usa Neutral); el `pin` de GSAP reinserta el nodo y retrasa el LCP (se usa `position: sticky`; GSAP ya no se usa).
- El banner de cookies se renderiza en el servidor; `CONSENT_BOOT_SCRIPT` (en `<head>`) lo oculta antes de pintar si hay consentimiento. Tiene altura mínima reservada para no causar CLS al cargar las fuentes.
- `npm run build` y `npm run dev` comparten `.next`: parar el servidor de desarrollo antes de compilar o pasar los tests.

## Convenciones

- Contenido visible en español de España con tildes; código, nombres de archivo y commits en inglés.
- Tuteo en la web; usted en legales.
- Las fotos de DealCar están en dos buckets de `storage.googleapis.com` (`vehicles-prd`, `vehicle-multipost-multimedia`); ambos están en `images.remotePatterns`.
- El logo se sirve `unoptimized` (el optimizador AVIF de Next se bloquea con ese PNG con transparencia).
- `PagePlaceholder` marca páginas aún no construidas; eliminar cuando se complete su fase.

## Inventario, ficha y formularios (Fases 3–4)

- Filtros en la URL (`src/lib/inventory/search-params.ts`, parámetros en español). `inventory-context.tsx` guarda el estado **pedido** hasta que el servidor devuelve esa misma consulta: con `useOptimistic` las casillas se desmarcaban si la respuesta tardaba.
- Favoritos y comparador en `localStorage` (`hooks/use-stored-ids.ts`); el comparador y otras piezas globales se cargan diferidas (`components/layout/deferred-extras.tsx`).
- Transición tarjeta → ficha: `components/motion/view-transitions.tsx` (View Transitions API; el nombre se asigna a la foto de la tarjeta al hacer clic, la galería lo lleva fijo).
- Formularios: piezas comunes en `components/forms/form-parts.tsx` (campos, consentimientos RGPD separados y sin marcar, capa de información básica, honeypot). Esquemas Zod compartidos cliente/servidor en `src/lib/validation/`. Envío en `src/lib/leads.ts` (Resend + webhook opcional; sin `RESEND_API_KEY` en producción → error, en desarrollo solo log). APIs: `/api/contact`, `/api/appointment`, `/api/valuation` (multipart con fotos comprimidas en el navegador, ≤ 4 MB por el límite de Vercel).
- Textos de páginas interiores en `src/content/pages.ts`; intros de marca en `src/content/brands.ts`. Legales con `components/layout/legal-page.tsx` (`.legal-prose`).

## SEO, rendimiento y accesibilidad (Fase 5)

- `sitemap.ts` (páginas, marcas, fichas no vendidas), `robots.ts` (indexa solo con `NEXT_PUBLIC_SITE_ENV=production`), JSON-LD `AutoDealer` en el layout, `Car`+`Offer`+`BreadcrumbList` en fichas, `FAQPage` en cada FAQ.
- `htmlLimitedBots: /.*/` en `next.config.ts`: sin él, las páginas dinámicas (`/vehiculos`, `/contacto`) emiten los metadatos en `<body>` (streaming metadata) y Lighthouse no ve la descripción.
- **Sin Motion ni GSAP** (retirados el 21/10 para subir Lighthouse a ≥ 90): revelados con `components/motion/reveal.tsx` (componentes de servidor que solo ponen `data-reveal*`), CSS en `globals.css` y el observador en línea `src/lib/reveal-script.ts` (lo activa la clase `js-reveal` que pone el script de `<head>`). Otras animaciones: CSS, Web Animations (FLIP en `results-grid.tsx`) o `requestAnimationFrame`. No reintroducir librerías de animación en el bundle inicial.
- Con `prefers-reduced-motion`, los revelados se muestran sin animar; axe medía el contraste con el texto a media opacidad.
- Formularios, calculadoras y visor de fotos se cargan diferidos (`components/forms/lazy.tsx`, `vehicle-gallery.tsx`).
- Inventario estático: `/vehiculos` y `/vehiculos/[marca]` son `force-static`; con filtros en la URL, `src/middleware.ts` reescribe a `/inventario-filtrado/…` (dinámica; misma UI vía `components/inventory/inventory-pages.tsx`). Al pasar de una a otra React remonta el árbol: lo que debe sobrevivir (panel de filtros móvil, scroll del lateral, posiciones FLIP) va en `inventory/persisted-ui.ts`, y la cortinilla de `template.tsx` solo sale si cambia la ruta visible.
- `<Suspense>` en layout (cabecera y pie), portada y tarjetas trocea la hidratación. **No** envolver `{children}` del layout: en páginas dinámicas React enviaba el armazón vacío y el contenido después.
- `next/link` se usa a través de `@/components/ui/link` (sin precarga en viewport; precarga por intención en `layout/intent-prefetch.tsx`).
- Titulares en fuente display: **nunca** `overflow-wrap: break-word` (partía «AVENTADO/R»). Los que pueden no caber usan `className="fit [--size:var(--text-4xl)]" style={fitHeading(texto)}` (`src/lib/utils/fit-heading.ts`) con `@container` en un ancestro: la letra se reduce lo justo para que la palabra más larga quepa entera. Si se cambia la fuente display, volver a medir la tabla de anchos.
- `contain-intrinsic-size` con un solo valor fija también el **ancho** (desbordaba el inventario en móvil): usar `contain-intrinsic-height`. Sin `hyphens: auto` en titulares (encarecía la primera maquetación).
- Si `next start` sirve HTML con chunks inexistentes (404 en `/_next/static`), borrar `.next/server/route-cache`: otro servidor del proyecto con una build anterior escribe ahí.
- Fuente display con `display: "swap"`: `optional` dejaba a menudo los titulares en la de reserva. Para evitar CLS, la cabecera de las páginas interiores ancla el texto arriba en móvil (`page-hero.tsx`).
- Lighthouse móvil: accesibilidad, buenas prácticas y SEO a 100; rendimiento 90–96 en todas las páginas (detalle y lo que lo hizo posible en `docs/despliegue.md` §6).

## Tests

- `tests/fixtures.ts`: `test` con consentimiento guardado y `page.goto`/`reload` que esperan a `html[data-hydrated]` (lo pone `ConsentProvider`): un clic antes de hidratar se pierde.
- `tests/a11y.spec.ts` pasa axe (WCAG 2.1 AA) por todas las páginas; excluye `.pending-marker`.
- Si los tests fallan en masa con 400 en `/_next/static`, suele quedar un `next start` viejo en el puerto 3100: cerrarlo.

## Despliegue (Fase 6)

- Vercel o Docker (`Dockerfile` + `docker-compose.yml`, salida standalone con `NEXT_OUTPUT=standalone`). Guía: `docs/despliegue.md`. Manual para el cliente: `docs/manual-cliente.md`.
