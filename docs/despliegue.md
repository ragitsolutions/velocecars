# Despliegue — Veloce Cars

Dos opciones: **Vercel** (recomendada: cero mantenimiento, CDN y optimización de imágenes
incluidas) o un **VPS con Docker**. En ambos casos el código es el mismo.

## 1. Antes de publicar (lista de comprobación)

1. Resolver los pendientes 🔴 de [`pendientes-cliente.md`](pendientes-cliente.md): datos
   registrales, teléfono y email oficiales, horario, garantía, IVA y revisión legal.
2. Sincronizar el stock: `npm run inventory:import -- --live` y `npm run inventory:validate`.
3. Cuenta de [Resend](https://resend.com) con el dominio `velocecars.es` verificado (registros
   DNS SPF/DKIM que indica Resend) y una API key.
4. `npm run lint`, `npm run build` y `npm run test:e2e` sin errores.
5. Tras el cambio de DNS: dar de alta el sitemap en Google Search Console y revisar en
   «Páginas» que las URL antiguas (`/buy/…`, `/sell`, `/contact`…) aparecen como redirigidas.

## 2. Variables de entorno

Plantilla completa en [`.env.example`](../.env.example).

| Variable                | Producción                  | Notas                                                                                      |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`  | `https://www.velocecars.es` | URLs canónicas, sitemap, Open Graph y JSON-LD.                                             |
| `NEXT_PUBLIC_SITE_ENV`  | `production`                | **Solo en producción.** En cualquier otro valor `robots.txt` bloquea la indexación.        |
| `RESEND_API_KEY`        | clave de Resend             | Sin ella, en producción los formularios responden error (en desarrollo solo se registran). |
| `CONTACT_FROM_EMAIL`    | `web@velocecars.es`         | Remitente (dominio verificado en Resend).                                                  |
| `CONTACT_TO_EMAIL`      | buzón que recibe los leads  | Contacto, citas y tasaciones (con las fotos adjuntas).                                     |
| `LEADS_WEBHOOK_URL`     | opcional                    | n8n / CRM: recibe cada lead en JSON (sin las fotos).                                       |
| `NEXT_PUBLIC_GTM_ID`    | opcional                    | Google Tag Manager; solo se carga con consentimiento analítico.                            |
| `INVENTORY_PROVIDER`    | `json`                      | `cms` cuando se conecte un CMS o feed (ver manual del cliente).                            |
| `VEHICLE_IMAGES_SOURCE` | `remote`                    | `local` sirve las copias de `public/vehicles/` (hay que generarlas y desplegarlas).        |

Las `NEXT_PUBLIC_*` se fijan **al compilar**: si cambian, hay que volver a desplegar.

## 3. Vercel (recomendado)

1. Subir el repositorio a GitHub (privado) e importarlo en Vercel → framework «Next.js»
   (detección automática, sin configuración adicional).
2. _Settings → Environment Variables_: las de la tabla anterior en el entorno **Production**.
   En **Preview** dejar `NEXT_PUBLIC_SITE_ENV=preview` para que las previsualizaciones no se
   indexen.
3. _Settings → Domains_: añadir `www.velocecars.es` y `velocecars.es` (este último redirigido
   a `www`). Vercel indica los registros DNS (A / CNAME) que hay que crear donde esté el
   dominio. El certificado HTTPS es automático.
4. Cada `git push` a la rama principal publica una versión nueva; cada rama, una
   previsualización con su propia URL.

**Límites a tener en cuenta**

- El cuerpo de una petición no puede superar 4,5 MB: el formulario de tasación comprime las
  fotos en el navegador y limita el total a 4 MB (`src/lib/validation/valuation.ts`).
- El límite de envíos por IP de los formularios vive en memoria de cada instancia: frena abusos
  simples; si hiciera falta algo más estricto, usar un almacén compartido (p. ej. Upstash).

## 4. VPS con Docker

Requisitos: Docker y Docker Compose en el servidor, y un proxy HTTPS delante (Caddy o Nginx).

```bash
git clone <repositorio> veloce-cars && cd veloce-cars
cp .env.example .env.production     # rellenar (ver tabla)
docker compose up -d --build        # compila la imagen y arranca en 127.0.0.1:3000
```

- La imagen ([`Dockerfile`](../Dockerfile)) usa la salida _standalone_ de Next.js
  (`NEXT_OUTPUT=standalone`), Node 22 y un usuario sin privilegios.
- [`docker-compose.yml`](../docker-compose.yml) monta `./data` como volumen: editar
  `data/vehicles.json` en el servidor actualiza el stock sin recompilar (los cambios aparecen
  en, como mucho, 1 hora por la revalidación ISR; `docker compose restart` los aplica al
  momento). La caché de imágenes optimizadas persiste en el volumen `next-cache`.
- Las `NEXT_PUBLIC_*` se pasan como _build args_ (las toma de `.env.production` o del
  entorno): tras cambiarlas, `docker compose up -d --build`.

Proxy HTTPS mínimo con **Caddy** (`/etc/caddy/Caddyfile`):

```
velocecars.es {
  redir https://www.velocecars.es{uri} permanent
}
www.velocecars.es {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
```

Actualizar a una versión nueva: `git pull && docker compose up -d --build`.

> La imagen se ha verificado ejecutando la salida _standalone_ con Node (páginas, sitemap,
> redirecciones 301, 404 y API). Docker no estaba disponible en el equipo de desarrollo, así
> que conviene hacer una primera prueba de `docker compose up --build` en el servidor.

## 5. Comprobaciones tras publicar

```bash
curl -sI https://www.velocecars.es/buy | head -3          # 301 → /vehiculos
curl -s https://www.velocecars.es/robots.txt              # Allow: / + Sitemap
curl -s https://www.velocecars.es/sitemap.xml | head      # páginas, marcas y fichas
```

- Enviar un formulario de prueba (contacto, cita y tasación) y comprobar que llegan el email
  al concesionario y el acuse al cliente.
- Lighthouse en móvil sobre la home, `/vehiculos` y una ficha (`npm run lhci` en local).
- Search Console: enviar `https://www.velocecars.es/sitemap.xml`.

## 6. Rendimiento: cómo leer Lighthouse

Resultados en local (build de producción, Lighthouse 12 móvil, 21/10/2026):

| Página               | Rend. | Accesib. | Buenas prácticas | SEO | LCP simulado | LCP observado | CLS   |
| -------------------- | ----- | -------- | ---------------- | --- | ------------ | ------------- | ----- |
| `/`                  | 92–95 | 100      | 100              | 100 | 2,8 s        | 0,27 s        | 0,012 |
| `/vehiculos`         | 90–91 | 100      | 100              | 100 | 3,4 s        | 0,25 s        | 0,001 |
| `/vehiculos/porsche` | 90–91 | 100      | 100              | 100 | 3,3 s        | 0,26 s        | 0,001 |
| Ficha (BMW X6)       | 93–96 | 100      | 100              | 100 | 3,1 s        | 0,23 s        | 0     |
| `/vendemos-tu-coche` | 92    | 100      | 100              | 100 | 3,2 s        | 0,23 s        | 0     |
| `/servicios`         | 93    | 100      | 100              | 100 | 3,1 s        | 0,24 s        | 0,012 |
| `/financiacion`      | 91    | 100      | 100              | 100 | 3,3 s        | 0,22 s        | 0     |
| `/nosotros`          | 91–95 | 100      | 100              | 100 | 3,3 s        | 0,21 s        | 0     |
| `/contacto`          | 91–92 | 100      | 100              | 100 | 3,2 s        | 0,22 s        | 0     |

Los rangos son de varias pasadas: la nota varía ±2 puntos entre ejecuciones. El LCP
**observado** (lo que ve una persona) está muy por debajo de 2,5 s; el **simulado**, que es el
que puntúa, depende sobre todo de los bytes y del JavaScript que se procesan antes del primer
pintado. Lo que más lo bajó (21/10/2026):

- **Sin Motion ni GSAP**: revelados al hacer scroll con CSS y un observador en línea
  (`src/lib/reveal-script.ts`), cortinilla con CSS, reordenación de resultados con la Web
  Animations API. −45 KB de JavaScript en todas las páginas.
- **Formularios, calculadoras y visor de fotos diferidos** (`components/forms/lazy.tsx`):
  se cargan al acercarse a la pantalla o tras la carga. Ficha de 194 a 128 KB.
- **Inventario estático**: `/vehiculos` y `/vehiculos/[marca]` sin filtros se sirven
  pregeneradas; con filtros, el middleware reescribe a la versión dinámica. La versión
  dinámica se envía en streaming y la compresión de Next rinde la mitad (48 KB frente a 24 KB).
- **Precarga por intención** de enlaces (`components/ui/link.tsx`), logo en WebP de 8 KB
  (antes PNG de 35 KB), menos anchos en los `srcset`, `content-visibility` en tarjetas y pie, y
  límites de `<Suspense>` para trocear la hidratación.

Si alguna página baja de 90, lo primero es revisar el JavaScript nuevo que se cargue en todas
las páginas (`npm run build` muestra el «First Load JS» de cada ruta).
