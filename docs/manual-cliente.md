# Manual del cliente — web de Veloce Cars

Guía para el día a día: stock, textos, formularios, el coche 3D de la portada y los datos
pendientes. Para publicar la web, ver [`despliegue.md`](despliegue.md).

---

## 1. El stock de vehículos

La web lee el stock de **una única fuente**, configurable con `INVENTORY_PROVIDER`:

| Fuente                        | Cuándo usarla                                   | Cómo se actualiza                                                  |
| ----------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| **DealCar → `vehicles.json`** | Hoy: seguís dando de alta los coches en DealCar | `npm run inventory:import -- --live` y publicar                    |
| **`vehicles.json` a mano**    | Si dejáis DealCar y el stock es pequeño         | Editar `data/vehicles.json` y publicar                             |
| **CMS o feed** (`cms`)        | Si queréis un panel de edición o un feed propio | Se edita en el CMS; la web lo recoge sola cada hora (sin publicar) |

> Elegid una. Si editáis `vehicles.json` a mano y después importáis de DealCar, la importación
> **sobrescribe** los cambios manuales.

### 1.1 Sincronizar con DealCar

```bash
npm run inventory:import -- --live   # descarga el stock publicado en DealCar
npm run inventory:validate           # comprueba que el archivo es correcto
```

Genera `data/vehicles.json` (fichas) y `data/legacy-redirects.json` (redirecciones de las URL
antiguas `/buy/…`). Después, publicar (en Vercel: `git commit` + `git push`).

### 1.2 Añadir un vehículo a mano

Copiad un vehículo existente de `data/vehicles.json` y cambiad sus datos. Campos clave:

| Campo                      | Ejemplo / regla                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `id`                       | Identificador único y estable (p. ej. un UUID). No reutilizar el de otro coche.                        |
| `slug`                     | Parte final de la URL: `911-carrera-4-gts-cabriolet-2024-b34a2b` (minúsculas, números y guiones).      |
| `brand` / `brandSlug`      | `Porsche` / `porsche`. El `brandSlug` crea la página de marca `/vehiculos/porsche`.                    |
| `model` / `version`        | `911` / `Carrera 4 GTS Cabriolet`                                                                      |
| `price`, `priceOld`        | En euros, sin puntos: `194990`. `priceOld` (opcional) activa la etiqueta «Precio rebajado».            |
| `priceNote`                | `IVA incluido` (recomendado indicarlo siempre).                                                        |
| `year`, `registrationDate` | Año y fecha de **matriculación** (`2024-01-01`).                                                       |
| `mileageKm`, `powerCv`     | `14000`, `480`                                                                                         |
| `fuel`                     | `Gasolina`, `Diésel`, `Híbrido`, `Híbrido enchufable` o `Eléctrico`                                    |
| `transmission`             | `Automático` o `Manual`                                                                                |
| `bodyType`                 | `Coupé`, `Cabrio`, `SUV`, `Berlina`, `Deportivo`, `Todoterreno`, `Familiar`, `Compacto`, `Monovolumen` |
| `condition`                | `Ocasión`, `Km 0`, `Nuevo` o `Clásico`                                                                 |
| `emissionLabel`            | `0`, `ECO`, `C` o `B` (distintivo DGT)                                                                 |
| `warrantyMonths`           | `12`; `warrantyOfficial: true` si es la garantía oficial de la marca                                   |
| `highlights`               | Argumentos cortos: `["Nacional", "Único propietario"]`                                                 |
| `equipment`                | Lista de equipamiento; la ficha la agrupa sola (seguridad, confort, multimedia…)                       |
| `description`              | Texto libre; separad párrafos con una línea en blanco (`\n\n`)                                         |
| `images`                   | `{ "src", "alt", "w", "h" }` por foto; la primera es la portada                                        |
| `featured`, `isNew`        | Destacado en la portada · etiqueta «Recién llegado»                                                    |

**Fotos.** Guardadlas en `public/stock/<id>/` (JPG o WebP, unos 1600–2000 px de ancho) y
usad `"src": "/stock/<id>/01.jpg"` con su ancho (`w`) y alto (`h`) reales. (No uséis
`public/vehicles/`: es la carpeta de las copias automáticas de DealCar y no se sube al
repositorio.) El texto `alt`
describe la foto («Porsche 911 GTS, vista lateral»): lo leen los lectores de pantalla y Google.

Al terminar, **siempre** `npm run inventory:validate`: indica el coche y el campo que falla.

### 1.3 Reservar o vender un vehículo

Cambiad `status`:

- `"reservado"` → etiqueta «Reservado» en la tarjeta y aviso en la ficha (sigue publicado).
- `"vendido"` → la tarjeta se atenúa con «Vendido», la ficha ofrece «Busco uno parecido», deja
  de estar en el sitemap y no se indexa. Pasadas unas semanas, podéis borrar el coche del
  archivo: su URL mostrará la página 404 con buscador y destacados.

### 1.4 Conectar un CMS o un feed

`src/lib/inventory/providers/cms-provider.ts` está preparado para leer una URL que devuelva el
stock en JSON (un CMS como Sanity o Payload, o un feed de AutoScout24 / Coches.net / DealCar).
Hace falta adaptar el «mapeo» de los campos de esa fuente al formato de la tabla anterior
(trabajo técnico de unas horas) y después:

```
INVENTORY_PROVIDER=cms
CMS_INVENTORY_URL=https://…
CMS_TOKEN=…
```

---

## 2. Textos de la web

| Qué                                                              | Dónde                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Teléfonos, emails, dirección, redes, datos de la empresa         | `src/lib/site.ts`                                                                      |
| Portada: propuesta de valor, servicios, proceso, preguntas       | `src/content/home.ts`                                                                  |
| Vender, servicios, financiación, nosotros, preguntas de contacto | `src/content/pages.ts`                                                                 |
| Texto de cada marca (`/vehiculos/porsche`…)                      | `src/content/brands.ts`                                                                |
| Condiciones de la calculadora (TIN, plazos, entrada)             | `src/lib/financing.ts`                                                                 |
| Textos legales                                                   | `src/app/aviso-legal`, `politica-privacidad`, `politica-cookies`, `condiciones-de-uso` |

Las preguntas frecuentes de cada página generan automáticamente sus datos estructurados para
Google (`FAQPage`).

---

## 3. Formularios y solicitudes

| Formulario                         | Dónde                                                                          | Llega a                                   |
| ---------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| Solicitar información de un coche  | Cada ficha                                                                     | `CONTACT_TO_EMAIL`, asunto «Interés en …» |
| Contacto general                   | `/contacto`                                                                    | `CONTACT_TO_EMAIL`                        |
| Cita previa                        | `/contacto#cita` (y «Reservar cita» de cada ficha, que preselecciona el coche) | `CONTACT_TO_EMAIL`, asunto «Cita · …»     |
| Tasación (3 pasos, hasta 10 fotos) | `/vendemos-tu-coche`                                                           | `CONTACT_TO_EMAIL` con las fotos adjuntas |
| Estudio de financiación            | `/financiacion`                                                                | `CONTACT_TO_EMAIL`                        |

- Cada persona recibe un **acuse de recibo** automático.
- Si se configura `LEADS_WEBHOOK_URL`, cada solicitud se envía también a n8n o al CRM.
- En cada email consta si la persona **aceptó comunicaciones comerciales** (casilla separada y
  opcional). Solo a quien la marcó se le pueden enviar ofertas.
- Las citas son **solicitudes**: hay que confirmar la hora por teléfono o WhatsApp.

---

## 4. Cookies y analítica

El banner cumple la guía de la AEPD: aceptar, rechazar y configurar al mismo nivel, y nada que
no sea técnico se carga antes de aceptar. Para medir visitas:

1. Crear un contenedor de Google Tag Manager y poner su ID en `NEXT_PUBLIC_GTM_ID`.
2. Configurar en GTM las etiquetas (GA4…) con el modo de consentimiento.
3. Actualizar la tabla de `/politica-cookies` con las cookies que añadan esas etiquetas.

El mapa de Google en Contacto solo se carga con consentimiento de marketing o si la persona
pulsa «Cargar mapa».

---

## 5. El coche de la portada

La portada muestra un coche girando (modelo 3D «Car Concept», licencia CC BY 4.0: **el crédito
del pie de página es obligatorio** mientras se use). No es una escena 3D en el navegador sino un
**vídeo** de una vuelta en bucle (~0,87 MB, horizontal para ordenador y vertical para móvil)
renderizado a partir del modelo: así arranca enseguida y gira también en cualquier móvil.
Mientras carga se ve un póster que es el primer fotograma del vídeo.

### Cambiar el coche por otro modelo 3D

1. Conseguid un modelo `.glb`/`.gltf` **con licencia que permita uso comercial** (guardad el
   enlace y la licencia; los modelos de marcas reales suelen tener restricciones).
2. Preparadlo (optimización y compresión Draco a `public/models/car.glb`):

   ```bash
   npm run 3d:model -- --source ruta/al/coche.glb
   ```

3. Regenerad pósteres y vídeos (necesita la web en marcha con la herramienta de render y
   Google Chrome instalado):

   ```bash
   RENDER_TOOLS=1 npm run dev        # en una terminal
   npm run 3d:render                 # en otra
   ```

4. Actualizad `docs/licencias-assets.md` y el crédito del pie (`src/components/layout/footer.tsx`).

### Usar un vídeo de uno de vuestros coches

Si grabáis un coche real girando en el estudio (lo más realista y sin licencias de terceros):
una vuelta completa con la cámara fija, en horizontal y en vertical. Se sustituyen
`public/hero/spin-landscape.mp4` y `spin-portrait.mp4` (H.264, ~1 MB cada uno) y los pósteres
`public/hero/poster-*.webp` por su primer fotograma. Pasadnos el material y lo preparamos.

---

## 6. Datos pendientes `[[PENDIENTE: …]]`

Lo que falta por confirmar aparece en la web **resaltado en amarillo** con el texto
`[[PENDIENTE: …]]`, para que nada inventado llegue a publicarse.

- Lista completa y explicada: [`pendientes-cliente.md`](pendientes-cliente.md) (con prioridad:
  🔴 bloquea la publicación).
- Para localizarlos en el código: buscar `PENDING(` en la carpeta `src/`.
- Cuando tengáis un dato, se sustituye el `PENDING("…")` por el texto real (p. ej. en
  `src/lib/site.ts`: `registry: "Registro Mercantil de Madrid, tomo …"`) y el marcador desaparece.

Antes de publicar no debe quedar ninguno: `grep -rn "PENDING(" src` no debería devolver nada
salvo la propia definición en `src/lib/site.ts`.
