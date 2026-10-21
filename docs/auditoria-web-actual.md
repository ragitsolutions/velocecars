# Auditoría de la web actual — velocecars.es

> Fase 0 · Fecha del rastreo: **20/10/2026** · Fuente: `https://www.velocecars.es/` (HTML servidor + payload RSC de Next.js + navegación real en navegador).
> Los textos entre comillas son **literales** de la web actual (erratas incluidas, marcadas con _[sic]_).
> Anexos con los datos en bruto: [`docs/anexos/`](anexos/).

---

## 0. Resumen ejecutivo — hallazgos que cambian el briefing

| #   | El briefing decía                               | La web real dice                                                                                                                                          | Impacto                                                                                                                          |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Concesionario que compra y vende premium        | **Asesoría automovilística / gestión de venta**: venden coches **de particulares** por cuenta de ellos (depósito o sin depósito), con trámites y garantía | El relato de marca y la página «Vendemos tu coche» deben girar en torno a _«vendemos tu coche por ti»_, no a _«te lo compramos»_ |
| 2   | Stock 35–50 vehículos                           | **100 vehículos listados** (+21 URLs en sitemap no listadas)                                                                                              | Inventario, filtros y rendimiento dimensionados para 100–150 fichas                                                              |
| 3   | Precios 20.000–260.000 €                        | **19.990 € – 549.000 €** (mediana 76.990 €)                                                                                                               | Slider de precio hasta 600.000 €                                                                                                 |
| 4   | Las Rozas / Pozuelo                             | **Av. de Luis García Cereceda 5, 28223 Pozuelo de Alarcón** (zona La Finca)                                                                               | —                                                                                                                                |
| 5   | Lema «Tu coche, tu decisión, nuestra prioridad» | **No aparece en ninguna página**. Claim real del hero: «VELOCE CARS · Asesoría Automovilística»                                                           | Confirmar lema con el cliente                                                                                                    |
| 6   | WordPress / plugin                              | **Plataforma SaaS DealCar** (dealcar.io): Next.js multi-tenant en Vercel, imágenes en Google Cloud Storage                                                | El stock vive en DealCar → adaptador `DealcarProvider` en vez de JSON manual                                                     |
| 7   | Testimonios                                     | Las 5 reseñas de Google embebidas **son reseñas de DealCar (el software)**, no de Veloce. Sección desactivada                                             | **No reutilizar.** Testimonios reales pendientes                                                                                 |
| 8   | Financiación con calculadora                    | Página `/financing` **desactivada** (vacía); FAQs genéricas (12–84 meses); ninguna ficha tiene TIN/TAE                                                    | Calculadora con parámetros `[[PENDIENTE]]`                                                                                       |

---

## 1. Tecnología detectada

- **Plataforma:** DealCar (`dealcar.io`) — web builder + DMS para compraventas. Footer: «© 2026 Powered by DealCar».
- **Stack:** Next.js (App Router, ruta interna `app/sites/[subdomain]/…`), servido por **Vercel** (`Server: Vercel`, `X-Powered-By: Next.js`).
- **Plantilla:** `template: "TECH"`, `theme: "neutral"`, fuente `EPILOGUE`. Fondo `bg-slate-950` (azul marino casi negro).
- **Datos:** configuración de la web y stock servidos desde la API de DealCar. IDs: `dealerId 1546932f-9962-4e19-954a-a5676adf72bd`.
- **Imágenes:**
  - Vehículos: `storage.googleapis.com/vehicles-prd/vehicles/{vehicleId}/images/{uuid}.jpg` (16–37 fotos por coche).
  - Web: `firebasestorage.googleapis.com/v0/b/web-builder/…`.
  - Logo: `storage.googleapis.com/…/dealer-images/…png`.
  - ⚠️ Si se da de baja DealCar, estas URLs pueden dejar de funcionar → descargar o mantener sincronización.
- **Integraciones de portales:** el modelo de datos tiene `cochesNetId`, `platform`, `platformId` (vacíos) → DealCar puede publicar en portales; no se ha visto feed público.
- **Analítica:** `googleAnalyticsId: ""`, `facebookPixelId: ""` → **sin analítica ni píxel**.
- **Cookies:** **no hay banner de cookies** (solo enlace «Cookies» en el footer que abre un modal con la política).
- **Redirecciones de dominio:** `http://velocecars.es` → `https://velocecars.es` → `https://www.velocecars.es/` (308). Canónico: **www**.
- **robots.txt:** `Allow: /` para todos; `Disallow: /` para **GPTBot**. Sitemap declarado.

---

## 2. Mapa del sitio y URLs

### 2.1 Menú principal (cabecera)

| Texto                         | URL             |
| ----------------------------- | --------------- |
| (logo)                        | `/`             |
| Vehículos de ocasión          | `/buy`          |
| Vende tu coche                | `/sell`         |
| Servicios                     | `/services`     |
| Contacto                      | `/contact`      |
| Botón «Contacta con nosotros» | `tel:618040537` |

> El logotipo de la cabecera es negro sobre fondo marino: **prácticamente invisible** (fallo visual actual).

### 2.2 Footer

- **«Ven a visitarnos»** — «Avenida de Luis García Cereceda 5, Pozuelo de Alarcón (Madrid)» · «Atendemos con cita previa».
- **«Veloce Cars»** — Compra (`/buy`) · Vende (`/sell`) · Servicios · Contacto.
- **«Legal»** — Política de privacidad · Aviso legal · Términos y condiciones · Cookies (los cuatro son **modales**, no URLs).
- **«Contacto»** — contacto@velocecars.es · 618040537 · Instagram.
- Botón flotante **WhatsApp** → `https://wa.me/+34618040537?text=Hola%20Veloce%20Cars%2C%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n.`

### 2.3 Todas las URLs (sitemap.xml)

| URL                                                                                                             | Título `<title>`                         | Estado                                        |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
| `/`                                                                                                             | «Veloce Cars»                            | Activa                                        |
| `/buy`                                                                                                          | «Compra - Veloce Cars»                   | Activa                                        |
| `/buy?bodyCodes=COUPE` (y `CABRIO`, `CUATRO_POR_CUATRO_SUV`, `BERLINA`, `FAMILIAR`, `MONOVOLUMEN`, `FURGONETA`) | —                                        | Enlaces desde los chips del hero              |
| `/buy/{uuid}` × **121**                                                                                         | «MARCA MODELO \| 174.500 €»              | 100 listadas + 21 solo en sitemap             |
| `/sell`                                                                                                         | «Vende tu coche - Veloce Cars»           | Activa                                        |
| `/services`                                                                                                     | «Postventa - Veloce Cars»                | Activa                                        |
| `/contact`                                                                                                      | «Contacta con nosotros - Veloce Cars»    | Activa                                        |
| `/financing`                                                                                                    | «Consigue tu financiación - Veloce Cars» | **Vacía** (módulo desactivado) pero indexable |
| `/privacy`, `/legal`, `/aviso-legal`, `/cookies`…                                                               | —                                        | 404 (los legales solo existen como modales)   |

Lista completa de UUIDs de vehículo: [`anexos/dealcar-fichas-2026-10-20.json`](anexos/dealcar-fichas-2026-10-20.json) y [`anexos/ids-listados-buy-2026-10-20.txt`](anexos/ids-listados-buy-2026-10-20.txt).

---

## 3. Home (`/`) — secciones en orden, textos literales

1. **Hero** (imagen: Porsche 911 GT3 Touring negro en estudio)
   - H1: «VELOCE CARS»
   - Subtítulo: «Asesoría Automovilística»
   - Buscador: placeholder «Buscar por marca, color, año…», botón «Filtrar» (Kilómetros, Precio, Año) y botón «Buscar».
   - Chips de carrocería: «Deportivo · Cabrio · SUV · Sedán · Familiar · Monovolumen · Furgoneta» → `/buy?bodyCodes=…`.
2. **«EN VENTA»** — «En Veloce Cars contamos con un stock exclusivo de coches de alta gama, seleccionados cuidadosamente.» Carrusel de 3 tarjetas (BMW X6, Porsche 911 Carrera 4 GTS Cabriolet, VW Golf GTI TCR) + botón «Ver coches».
3. **Propuesta** (imagen: Porsche 911 azul en estudio con matrícula VELOCECARS)
   - H1: «ASESORÍA AUTOMOVILÍSTICA»
   - «Veloce Cars se dedica principalmente a gestionar todo el proceso de venta y postventa de vehículos. Cuidando cada detalle y a cada cliente.»
   - Botón «Ver coches» → `/buy`.
4. **«Nuestros servicios»** — «Personalización y servicios a medida para cada situación.» 6 tarjetas con icono:
   | Título                                 | Texto                                                                          |
   | -------------------------------------- | ------------------------------------------------------------------------------ |
   | REVISIÓN DEL VEHÍCULO                  | «Revisión del funcionamiento y estado del vehículo.»                           |
   | REPORTAJE AUDIOVISUAL                  | «Fotografías y vídeos del vehículo para una mejor difusión.»                   |
   | ESTUDIO DE MERCADO                     | «Venta del vehículo en un precio óptimo.»                                      |
   | PUBLICIDAD Y ANUNCIOS                  | «Máxima visibilidad y difusión del vehíuclo _[sic]_.»                          |
   | ATENCIÓN AL CLIENTE                    | «Trato cercano y profesional para todos los interesados.»                      |
   | TRÁMITES Y GARANTÍAS                   | «Ejecutamos todos los trámites de transferencia y ofrecemos Garantía Premium.» |
   | Botón «Más información» → `/services`. |
5. **«Síguenos en Redes sociales»** — «@velocecar» (feed/enlace social).
6. **Sobre nosotros** — H1: «VELOCE CARS» · «Entedemos _[sic]_ la importancia de tu coche... y nos aseguramos de transmitirla a su nuevo dueño. Nos encargamos personalmente de vender tu coche como si fuera el nuestro.»
7. **«Preguntas frecuentes»** (acordeón):
   - «QUIERO VENDER MI COCHE ¿CÓMO TRABAJÁIS?» → «En Veloce Cars nos encargamos de toda la gestión oportuna para la venta de tu vehículo ofreciendo un trato exclusivo y personalizado a tus necesidades. Contacta con nosotros sin compromiso para explicarnos lo que necesitas.»
   - «¿LOS VEHÍCULOS QUE TENÉIS EN VENTA PROVIENEN DE PARTICULAR?» → «Si, todos nuestros vehículos provienen de clientes que lo quieren vender. Por ello nosotros, llevamos a cabo todo el proceso de venta y de postventa (cambio de nombre, transferencia, garantías...)»
   - «¿ACEPTÁIS COCHE COMO FORMA DE PAGO?» → «Principalmente a lo que nos dedicamos es a ayudar a clientes a vender sus vehículos. Pero en caso de que lleguemos a un buen acuerdo, SI, lo podemos valorar.»
   - «¿PUEDO SEGUIR UTILIZANDO EL COCHE HASTA QUE SE VENDA?» → «Por supuesto, contamos con 2 variantes. La primera es que el cliente siga con el vehículo hasta que se venda y la segunda, que lo pueda dejar en la exposición para darle más visibilidad.»
   - «¿Ofrecéis RENTING?» → «Sí, ofrecemos RENTING a medida de todos los coches que tenemos en stock.»
8. Footer (ver §2.2).

**Módulos configurados pero desactivados** (texto existente reutilizable):

- «Deja tu coche en nuestras manos» — «Confía en Veloce Cars para gestionar la venta de tu vehículo. Desde la valoración inicial hasta la entrega final, nos ocupamos de todo, con la posibilidad de dejar tu coche en nuestra exposición para maximizar su visibilidad y acelerar la venta.» Botón «Tasa tu vehículo» → `/sell`.
- «Testimonios — Valoraciones de nuestros clientes»: **rating 4,8 y 5 reseñas que pertenecen a DealCar** (Place ID `ChIJfUoEN_0pQg0Rzf4yGRUWru8`). ❌ No usar.

**Meta (todas las páginas):** misma `description` duplicada: «En Veloce Cars hacemos que vender o comprar tu coche en Pozuelo de Alarcón sea rápido, seguro y sin complicaciones. Nos encargamos de todo el proceso de gestión de venta y ofrecemos asesoramiento experto para que tomes decisiones con total confianza. Con un trato cercano y profesional, nuestro objetivo es que disfrutes de una experiencia clara, transparente y totalmente personalizada.»

---

## 4. Inventario (`/buy`)

### 4.1 Cabecera de la página

- H1: «Descubre nuestra oferta de vehículos» · «Busca tu coche en nuestra amplia gama de vehículos de ocasión».
- Contador: «100 Vehículos disponibles».
- Módulo desactivado: «Coches de alta gama, listos para ti» / «Elegancia, potencia y exclusividad en un solo lugar» / «Descubre nuestro stock de vehículos de lujo cuidadosamente seleccionados y revisados. En Veloce Cars encontrarás coches de alta gama listos para conducir, con la confianza y el respaldo de un servicio profesional y cercano.»

### 4.2 Filtros (panel lateral)

Búsqueda libre («Buscar por marca, color…») · **Marca** · **Modelo** · **Motor** (combustible) · **Carrocería** · **Transmisión** · **Etiqueta ecológica** (rotulado _«Stockbyecologicallabel»_, clave sin traducir) · **Ubicación** (_«Locationstore»_, sin traducir; solo hay 1 sede) · **Kilómetros** · **Precio** · **Año** · botones «Buscar» y «Eliminar filtros».
URL con query params: `bodyCodes`, `brands`, `models`, `engineTypes`, `transmission`, `search`.

### 4.3 Ordenación

«Por defecto» · «Últimas publicaciones» · «Precio Ascendente» · «Precio Descendente» · «Alfabético Ascendente» · «Alfabético Descendente».

### 4.4 Paginación

**Scroll infinito** (lotes de 9 vía server action `POST /buy`). Sin paginación numerada → peor para SEO y para compartir.

### 4.5 Tarjeta de vehículo

Carrusel de todas las fotos (flechas) · Marca + modelo en mayúsculas («PORSCHE 911») · versión · **icono de etiqueta DGT** (C / ECO / 0 / B) · «Al contado» · precio («194.990 €») · año · km · combustible · cambio · ubicación («Madrid») · CTA «¿Te interesa? Contactar».
Sin badges de reservado / vendido / novedad / rebaja (aunque la configuración admite `AVAILABLE, BOOKED, IN_PREPARATION, SOLD`, los 121 coches figuran como `AVAILABLE`).

### 4.6 Composición del stock (100 listados)

| Marca               | Uds. |     | Marca                   | Uds.  |
| ------------------- | ---- | --- | ----------------------- | ----- |
| Porsche             | 23   |     | Ferrari                 | 4     |
| BMW                 | 18   |     | Land Rover              | 4     |
| Mercedes-Benz / AMG | 16   |     | Aston Martin            | 2     |
| Audi                | 10   |     | Ford (Mustang)          | 2     |
| Lamborghini         | 5    |     | Jeep                    | 2     |
| Maserati            | 5    |     | Toyota (GR Yaris)       | 2     |
| Volkswagen          | 4    |     | Bentley, Hyundai, Tesla | 1 c/u |

- Precio: mín. **19.990 €** (Range Rover Sport 2010) · máx. **549.000 €** (Lamborghini Aventador LP 750-4 Superveloce, 2017) · mediana **76.990 €**.
- Combustible (121 fichas): Gasolina 86 · Híbrido enchufable 15 · Híbrido 9 · Diésel 8 · Eléctrico 3.
- Cambio: Automático 113 · Manual 8.
- Etiqueta DGT: C 84 · 0 17 · ECO 12 · B 5.
- Incluye un **clásico**: Mercedes-Benz 190 SL de 1964 y una **moto** (Yamaha R1, no listada).
- Tabla completa vehículo a vehículo: [`anexos/stock-actual.md`](anexos/stock-actual.md).

**Problemas de calidad de datos detectados**

- Versión con la marca repetida («BMW X6 BMW X6 xDrive30d M Sport», «Mercedes-Benz Clase S Mercedes-AMG S 63 L»).
- Carrocerías mezcladas en inglés/español y duplicadas (`CONVERTIBLE`/`CABRIO`, `SEDAN`/`BERLINA`, `HATCHBACK` para Golf y Panamera).
- Garantía en formato libre: «12», «12 meses», «12 meses (1 año) Oficial», «36 meses (3 años) Oficial».
- Algunos híbridos ligeros etiquetados como «Híbrido» con CO₂ = 0.
- Año del listado ≠ año de la ficha en algún caso (Lamborghini Urus `d41652bd…`: 2019 en tarjeta, 2024 en ficha).
- 21 fichas siguen publicadas en sitemap aunque no aparecen en el listado (probablemente vendidas) → contenido obsoleto indexado.

---

## 5. Ficha de vehículo (`/buy/{uuid}`)

Ejemplo analizado: Ferrari 458 Italia (`95534197-…`).

- **Galería:** imagen principal + fila de miniaturas (sin lightbox a pantalla completa, sin zoom).
- **Bloque de precio (lateral):** «FERRARI 458» · «Italia» · chips (año, cambio, combustible, CV, km) · «Madrid» · «Al contado» + icono info · **«174.500 €»** · botón compartir · icono etiqueta DGT · botones **«Llamar ahora»** y **«Agendar cita»**.
- **«Agendar cita»** abre el modal «Reserva tu cita en Veloce Cars»: Nombre, Apellido, Email, Teléfono (prefijo 🇪🇸), **fecha** (dd/mm/aaaa), **hora** («Selecciona una hora»), mensaje precargado «Estoy interesado en Ferrari 458 Italia», casilla de consentimiento y «Enviar».
- **«Detalles»:** descripción libre del vendedor (con «Ver más»). Patrón habitual: «Ubicación: La Finca, Pozuelo (Madrid)», «*Nacional», «*Único propietario», «*Revisiones en casa oficial», lista de «Características» y cierre «Si le interesa y quiere saber más información, no dude en contactar ¡será un placer!» (trato de **usted** en las fichas).
- **Tasación de tu coche (trade-in):** «¿Tienes un vehículo? Tásalo al mejor precio» · «En un cuestionario te damos un precio a descontar sobre tu compra. Se recogerá en el momento de la entrega.» · «Iniciar tasación».
- **«Datos básicos»:** Año · Kilómetros · Combustible · Cambio · Potencia · Puertas · Etiqueta · Carrocería.
- **«Ficha técnica y especificaciones»:**
  - _Motor y Prestaciones:_ Velocidad máxima · Plazas · Aceleración (0-100 km/h) · Puertas · Potencia · Garantía · Número de cilindros · Capacidad del cilindro · Transmisión · Ubicación.
  - _Consumo y emisiones:_ consumo mixto (l/100) · CO₂ · etiqueta.
  - _Dimensiones y otros datos:_ largo · ancho · alto (mm) · peso (kg).
- **Formulario «Quiero más información de este coche»:** Nombre · Apellido · Email · Teléfono · Mensaje · **una sola casilla**: «Acepto las comunicaciones comerciales y de ofertas. Acepto la política de privacidad.» · «Enviar».
- Equipamiento estructurado: el modelo lo admite (`extraEquipment`, visibilidad activada) pero **ningún coche lo tiene relleno**; el equipamiento está dentro de la descripción libre.
- **Sin** financiación/cuota, **sin** vídeo (campo existe, vacío en todos), **sin** vehículos similares, **sin** JSON-LD, **sin** canonical.

**Campos disponibles en el modelo de DealCar** (útiles para el mapeo a `Vehicle`): `brand, model, version, price, pricing.sellTaxType (IVA_21), pricing.taxIncluded, pricing.financing{installments, tae, tin, …}, year, kilometers, engineType, vehicleDetails{bodyCode, bodyTypeText, transmission, traction, powerHsPs, powerKw, cylinderCapacity, cylinders, co2, consumption, ecologicalLabel, doors, seats, length, width, height, kg, maxSpeed, acceleration}, optionalFields{color, metallic, matte, guarantee, licensePlate, registrationDate, location, comment, maintenanceLog}, mediaUrls[], videoUrl, youtubeUrl, status`.

---

## 6. Vende tu coche (`/sell`)

- Título: «Tasa y vende fácilmente» · «Consigue la mejor oferta del mercado».
- **Formulario en 5 pasos** con barra de progreso: 1 Vehículo · 2 Datos · 3 Imágenes · 4 Propietario · 5 Tasación.
- Paso 0: elegir «Tasa un Turismo» (_Monovolúmen, 4x4, coupé, berlina, furgoneta turismo..._) o «Tasa un Vehículo Industrial» (_Furgón, furgoneta frigorífica..._).
- Paso 1 (Turismo): Marca (desplegable con búsqueda) · Modelo · Año · Carrocería · Color · Combustible · Tipo de cambio (Manual / Automático) · Versión · Kilometraje · Matrícula (opcional) · «Volver» / «Siguiente».
- Módulos desactivados con texto de plantilla que **menciona «Dealcar»** (no reutilizar tal cual): «Tasación inmediata, mejor precio garantizado»; pasos «1. Contesta nuestro formulario · 2. Recibimos tu información · 3. Nos ponemos en contacto contigo».
- FAQ de tasación (desactivada, texto propio reutilizable):
  - «¿Cómo puedo tasar mi coche con Veloce Cars?» → «Puedes solicitar la tasación online o de forma presencial. Solo necesitamos los datos básicos de tu vehículo —marca, modelo, año, kilometraje y estado— para ofrecerte una valoración profesional y ajustada al mercado.»
  - «¿La tasación tiene algún coste o compromiso?» → «No. En Veloce Cars la tasación es gratuita y sin compromiso, permitiéndote conocer el valor real de tu coche sin obligación de venderlo.»
  - «¿Qué documentación necesito para realizar la tasación?» → «Se requiere la ficha técnica, el permiso de circulación y, si es posible, el historial de mantenimiento. Si adjuntas fotos recientes, la valoración será más precisa.»
  - «¿Cuánto tardo en recibir la tasación?» → «En la mayoría de los casos, recibirás una valoración en menos de 24 horas. Si prefieres, puedes acudir a nuestras instalaciones para una tasación inmediata y presencial.»
  - «¿Puedo entregar mi coche como parte del pago?» → «Sí. En Veloce Cars aceptamos tu coche como parte del pago al adquirir otro vehículo de nuestro stock, haciendo la operación más sencilla y rápida.»
  - «¿Por qué tasar mi coche con Veloce Cars?» → «Porque ofrecemos tasaciones justas, transparentes y rápidas, realizadas por profesionales con experiencia. Garantizamos un proceso seguro y confiable, con asesoramiento personalizado en cada paso.»

---

## 7. Servicios (`/services`, título «Postventa»)

- Hero: «ASESORAMIENTO PERSONALIZADO» · «El principal objetivo de VELOCE CARS es ofrecer un trato exclusivo y personalizado a las necesidades de sus clientes.»
- 4 servicios (versión larga):
  | Servicio              | Texto literal                                                                                                                                  |
  | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
  | REVISIÓN DEL VEHÍCULO | «Revisamos el funcionamiento y estado del vehículo para transmitirlo al futuro comprador.»                                                     |
  | REPORTAJE AUDIOVISUAL | «Realizamos fotografías y vídeos del vehículo con el fin de darle la mejor visibilidad.»                                                       |
  | ESTUDIO DE MERCADO    | «Con el fin de ofrecer la máxima tasación para la venta del vehículo, acordamos el mejor precio.»                                              |
  | PUBLICIDAD Y ANUNCIOS | «Le damos la máxima visibilidad ofreciéndo _[sic]_ el vehículo a nuestra cartera de clientes y ofertándolo en todas las plataformas de venta.» |
- Banner: «¿QUIERES VENDER TU COCHE?» · botón «Rellena el formulario de contacto» → `/contact`.
- «VEHÍCULOS EN VENTA» (carrusel de 3) · «Síguenos en Redes sociales @velocecar».
- FAQ desactivada (texto reutilizable):
  - «¿En qué consiste el servicio de gestión de venta de Veloce Cars?» → «Nos encargamos de vender tu coche por ti: tasación profesional, preparación del vehículo, fotografías de calidad, publicación en portales, atención a compradores, negociación y gestión completa de la documentación.»
  - «¿Cómo determináis el precio adecuado para vender mi coche?» → «Realizamos un análisis exhaustivo del mercado, comparando modelos similares y evaluando el estado del vehículo para fijar un precio competitivo y realista, que acelere la venta sin perder valor.»
  - «¿Qué ventajas ofrece la gestión de venta frente a vender por mi cuenta?» → «Ahorro de tiempo, mayor visibilidad, seguridad en el pago y asesoramiento profesional durante todo el proceso. Con Veloce Cars, tú solo recibes el pago, nosotros nos ocupamos del resto.»
  - «¿Qué incluye la asesoría automovilística?» → «Nuestro equipo ofrece orientación experta en compra, venta, importación, financiación y mantenimiento, ayudándote a tomar decisiones informadas y a optimizar tu inversión.»
  - «¿Es necesario dejar el coche en depósito mientras se gestiona la venta?» → «Depende de tu preferencia. Aunque no es obligatorio, dejar el coche en nuestras instalaciones facilita visitas, revisiones y una venta más ágil.»
  - «¿Qué trámites gestionáis una vez se encuentra comprador?» → «Nos encargamos de contratos, transferencia de titularidad, verificación documental y garantías legales, garantizando que la venta se realice de manera segura y sin complicaciones.»

### 7.1 Catálogo consolidado de servicios (todas las fuentes)

1. **Gestión integral de venta** (venta por cuenta del particular, con o sin depósito en exposición).
2. **Tasación** gratuita y sin compromiso (online < 24 h o presencial).
3. **Revisión del vehículo.**
4. **Reportaje audiovisual** (fotos y vídeo en estudio propio).
5. **Estudio de mercado** / fijación de precio.
6. **Publicidad y anuncios** en portales y cartera de clientes.
7. **Atención al cliente** / negociación con compradores.
8. **Trámites:** contrato, transferencia, cambio de nombre, verificación documental.
9. **Garantía** (12 meses habitual; «Garantía Premium» mencionada; algunas fichas con garantía oficial de marca hasta 36 meses).
10. **Renting** a medida de cualquier coche del stock.
11. **Financiación** (mencionada en FAQs; página desactivada).
12. **Coche como parte de pago** (se valora caso a caso).
13. **Asesoría** en compra, venta, **importación**, financiación, mantenimiento y **seguro**.
14. **Reserva** de vehículo con señal (configurada: «Reserva por 1000€, No pierdas la oportunidad.», 15 días, no reembolsable) — **desactivada**.

---

## 8. Financiación (`/financing`) — desactivada

Página vacía en producción. Textos configurados (algunos de plantilla DealCar):

- «Opciones de financiación disponibles» · «Porque la vida da muchas vueltas, escoge la financiación que mejor se adapta a tus necesidades.»
- «Tu financiación a medida» · «Financiación para particulares» · «Financiación para colectivos, empresas y autónomos».
- «Financiación Convencional» — «Una vez revisada toda la documentación por nuestro equipo financiero, te confirmaremos en el mismo día si la financiación ha sido aprobada.»
- «Financiación Online» — «Un asesor contactará contigo para guiarte paso a paso. Tendrás que conectarte a tu banca online y sabrás al momento si la financiación ha sido aprobada.»
- Banner con texto **de plantilla que dice «En Dealcar…»** ❌.
- FAQs: financiación para todos los coches; documentación (DNI/NIE, nómina o pensión, recibo bancario); **plazos 12–84 meses**; financiar el 100 % o con entrada; aprobación < 24 h; «tipos de interés competitivos».
- **No hay entidad financiera, TIN, TAE ni comisiones** en ningún sitio.

---

## 9. Contacto (`/contact`)

- Hero (imagen BMW M4 amarillo en estudio): «Contacta con nosotros» · «Para información sobre nosotros o cualquier vehículo no dudes en contactarnos».
- Formulario: Nombre · Apellido · Email · Teléfono · Mensaje · casillas «Acepto las comunicaciones comerciales y de ofertas.» / «Acepto la política de privacidad.» · «Enviar».
- Tarjetas: **«Llámanos»** +34 618040537 · **«Escríbenos»** velocecars1@gmail.com · **«Visítanos»** Avenida de Luis García Cereceda 5, Pozuelo de Alarcón (Madrid) + «Abrir Google Maps».
- «Nuestra ubicación» · «Atendemos con cita previa» · mapa.
- FAQ desactivada (reutilizable): cómo funciona la gestión; «todos nuestros vehículos están revisados y certificados, con historial completo y garantía»; horario «Atendemos con cita previa»; asesoría (tasación, financiación, seguro); ventajas; tasación y renting.

---

## 10. Datos de contacto y empresa (reales)

| Dato                     | Valor                                                                                                            | Dónde aparece                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Nombre comercial         | Veloce Cars                                                                                                      | Todo el sitio                                  |
| Razón social             | **Casado Aguilera Motor SL**                                                                                     | Aviso legal, Privacidad                        |
| CIF                      | **B55499149**                                                                                                    | Aviso legal, Privacidad                        |
| Domicilio                | Avenida de Luis García Cereceda 5, 28223 Pozuelo de Alarcón, Madrid                                              | Todo el sitio                                  |
| Teléfono 1               | **619 625 040**                                                                                                  | Legales, ficha de sede (`mobilePhone`)         |
| Teléfono 2 / WhatsApp    | **618 040 537**                                                                                                  | Cabecera, footer, WhatsApp, contacto           |
| Email público            | **contacto@velocecars.es**                                                                                       | Footer                                         |
| Email 2                  | **velocecars1@gmail.com**                                                                                        | Contacto, legales (ejercicio de derechos RGPD) |
| Horario                  | «Atendemos con cita previa» (sin horario concreto)                                                               | Footer, contacto                               |
| Instagram                | `@veloce_cars` → https://instagram.com/veloce_cars (la web genera `instagram.com//veloce_cars`, con doble barra) | Footer                                         |
| TikTok                   | `@velocecar` → https://tiktok.com/@velocecar                                                                     | Home («@velocecar»)                            |
| Facebook / LinkedIn / X  | No tienen                                                                                                        | —                                              |
| Google Maps              | Coordenadas 40.4038716, -3.7921312 (Av. de Luis García Cereceda, 5)                                              | Contacto                                       |
| Ficha de Google Business | **No identificada** (el Place ID configurado es el de DealCar)                                                   | —                                              |

---

## 11. Textos legales existentes

Los cuatro se muestran como **modales** desde el footer (no tienen URL propia).

- **Aviso legal** — LSSI-CE: nombre comercial, titular Casado Aguilera Motor SL, CIF B55499149, domicilio, velocecars1@gmail.com, 619 625 040. **Faltan los datos registrales** (Registro Mercantil de Madrid: tomo, folio, hoja, inscripción) exigidos por el art. 10 LSSI.
- **Política de privacidad** — RGPD/LOPDGDD: responsable, finalidades (consultas, relación comercial, comunicaciones con consentimiento), legitimación (consentimiento/contrato), conservación, cesiones (gestoría, hosting), derechos ante velocecars1@gmail.com + reclamación AEPD. **No menciona** a DealCar como encargado del tratamiento ni transferencias internacionales (Google Cloud / Vercel en EE. UU.).
- **Términos y condiciones** — objeto, condiciones de uso, propiedad intelectual, responsabilidad, enlaces externos.
- **Política de cookies** — define técnicas, analíticas («ej. Google Analytics») y de personalización; dice «El usuario puede aceptar, rechazar o configurar las cookies mediante el banner del sitio web», **pero no existe banner**.

Texto íntegro de los cuatro: [`anexos/config-dealcar-2026-10-20.json`](anexos/config-dealcar-2026-10-20.json) (`settingsWeb.legalAdvise`, `.cookies`) y §11.1.

### 11.1 Incumplimientos y riesgos detectados

1. **Consentimiento agrupado** en la ficha de vehículo: una sola casilla para privacidad **y** comunicaciones comerciales (debe separarse; la comercial no puede condicionar el envío).
2. **Sin capa de información básica** junto a los formularios.
3. **Sin banner de cookies** conforme a la guía AEPD (aunque hoy no se cargan cookies analíticas).
4. Falta inscripción registral en el aviso legal.
5. Precio «Al contado» sin indicar de forma visible si incluye IVA/impuestos en la tarjeta (en datos: `taxIncluded: true`, `IVA_21` solo en 21 fichas).
6. Sin mención a la garantía legal en la ficha (solo «Garantía 12»).

---

## 12. Identidad visual actual

### 12.1 Logotipo

- **Wordmark tipográfico «VELOCE CARS»** en serif clásica de versalitas (estilo Garamond / Cormorant). Sin símbolo/isotipo.
- Versiones descargadas a `public/assets/original/`:
  | Archivo                              | Descripción               | Tamaño   |
  | ------------------------------------ | ------------------------- | -------- |
  | `logo-veloce.png`                    | Negro sobre transparente  | 2048×274 |
  | `logo-veloce-blanco.png`             | Blanco sobre transparente | 500×500  |
  | `logo-veloce-blanco-sobre-negro.png` | Blanco en caja negra      | 500×500  |
  | `favicon.png` / `webclip.png`        | Blanco sobre negro        | 256×64   |
- Carácter: elegante, clásico, monocromo → encaja con «lujo silencioso» y con una **serif display** para titulares.

### 12.2 Paleta actual

- Fondo `slate-950` ≈ `#020617` (azul marino muy oscuro), tarjetas `slate-800/700`, texto blanco, botones blancos con texto negro, WhatsApp verde.
- **No hay color de marca**: el logo es monocromo. El acento oro champán propuesto (`#C9A96E`) no choca con nada existente.

### 12.3 Tipografía actual

- **Epilogue** (grotesk geométrica de la plantilla DealCar «TECH»). No es la del logo.

### 12.4 Fotografía

- **Estudio propio** con fondo negro, focos cenitales y suelo pulido reflectante; matrícula personalizada **«VELOCECARS»**. Calidad alta y consistente → muy reutilizable y totalmente alineada con la dirección «oscuro, cinematográfico».
- Imágenes de la web descargadas:
  | Archivo                                    | Contenido                                         | Origen probable                                                 |
  | ------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------- |
  | `propuesta-asesoria.jpg` (2000×1153)       | Porsche 911 (992) azul, estudio, placa VELOCECARS | **Propia** ✅                                                   |
  | `deja-tu-coche.jpg` (1986×1475)            | Ferrari 458 Spider rojo, estudio                  | **Propia** ✅                                                   |
  | `servicios-quieres-vender.jpg` (2000×1471) | Lamborghini Aventador verde, placa VELOCECARS     | **Propia** ✅                                                   |
  | `contacto-hero.jpg` (2000×651)             | BMW M4 amarillo, estudio                          | **Propia** ✅                                                   |
  | `hero-home.png` (2048×1152)                | Porsche 911 GT3 Touring negro, fondo degradado    | ⚠️ Origen no verificado (posible render/banco de imágenes)      |
  | `servicios-fondo.jpg` (3840×2160)          | Silueta trasera de Porsche 911 en negro           | ⚠️ Origen no verificado                                         |
  | `servicio-*.png/webp` (512×512)            | Iconos de línea negros                            | ⚠️ Iconos genéricos (probable banco); se sustituirán por Lucide |
- **Fotos de vehículos:** 16–37 por coche en GCS (`vehicles-prd`). No se han descargado aún (≈ 3.000 imágenes); ver decisión en `pendientes-cliente.md`.

---

## 13. SEO actual

| Aspecto          | Estado                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `<title>`        | Genéricos («Veloce Cars», «Compra - Veloce Cars»); fichas «FERRARI 458 \| 174.500 €» sin año, km ni ciudad |
| Meta description | **Idéntica en todas las páginas** (en fichas, prefijada con la versión)                                    |
| H1               | Home con **3 H1**; `/sell` y `/financing` **sin H1**; fichas con 4 H1                                      |
| Canonical        | **No hay**                                                                                                 |
| JSON-LD          | **No hay** (ni `AutoDealer`, ni `Car`, ni `FAQPage`)                                                       |
| Open Graph       | `og:url` erróneo (`https://www.velocecars.es.on.dealcar.es`)                                               |
| URLs de ficha    | UUID sin palabras clave (`/buy/95534197-7777-…`)                                                           |
| Sitemap          | Incluye 21 fichas no listadas; `/financing` vacía indexable                                                |
| Idioma de rutas  | Inglés (`/buy`, `/sell`, `/services`, `/contact`)                                                          |
| Paginación       | Scroll infinito sin enlaces rastreables a partir del 9.º coche (dependencia del sitemap)                   |
| Imágenes         | `alt="Image"` genérico en todas las fotos de vehículo                                                      |
| Rendimiento      | Home de ~340 KB HTML + 33 imágenes por tarjeta de carrusel cargadas a la vez                               |

### 13.1 Mapa de redirecciones 301 propuesto (crítico)

| URL antigua                            | URL nueva                                                            |
| -------------------------------------- | -------------------------------------------------------------------- |
| `/buy`                                 | `/vehiculos`                                                         |
| `/buy?bodyCodes=COUPE`                 | `/vehiculos?carroceria=coupe`                                        |
| `/buy?bodyCodes=CABRIO`                | `/vehiculos?carroceria=cabrio`                                       |
| `/buy?bodyCodes=CUATRO_POR_CUATRO_SUV` | `/vehiculos?carroceria=suv`                                          |
| `/buy?bodyCodes=BERLINA`               | `/vehiculos?carroceria=berlina`                                      |
| `/buy?bodyCodes=FAMILIAR`              | `/vehiculos?carroceria=familiar`                                     |
| `/buy?bodyCodes=MONOVOLUMEN`           | `/vehiculos?carroceria=monovolumen`                                  |
| `/buy?bodyCodes=FURGONETA`             | `/vehiculos?carroceria=furgoneta`                                    |
| `/buy/{uuid}` (vehículo existente)     | `/vehiculos/{marca}/{slug}` — mapa generado desde el `id` de DealCar |
| `/buy/{uuid}` (vehículo ya vendido)    | `/vehiculos/{marca}` (landing de marca) o `/vehiculos`               |
| `/sell`                                | `/vendemos-tu-coche`                                                 |
| `/services`                            | `/servicios`                                                         |
| `/contact`                             | `/contacto`                                                          |
| `/financing`                           | `/financiacion`                                                      |

Se conservará el UUID de DealCar como `id` del vehículo para poder generar estas redirecciones automáticamente.

---

## 14. Recomendaciones para la nueva web (derivadas de la auditoría)

1. **Inventario conectado a DealCar**, no a un JSON manual: implementar `DealcarProvider` (además de `JsonProvider`) si el cliente sigue usando DealCar como DMS. El JSON queda como fallback y para desarrollo.
2. **Usar el stock real** como datos iniciales (100 vehículos, mapeados al tipo `Vehicle`) en lugar de 24 ficticios, si el cliente lo aprueba.
3. Reposicionar el discurso en **gestión de venta premium + compra con garantía**, con dos recorridos claros: _«Quiero comprar»_ / _«Quiero vender mi coche»_.
4. Reutilizar la **fotografía de estudio propia** como pilar visual (hero, secciones, fichas).
5. Mantener y ampliar el **flujo de cita previa** (ya existe fecha + hora en la ficha): llevarlo a `/contacto` y a todas las fichas.
6. Unificar teléfonos y emails, y corregir Instagram.
7. Pasar todos los legales a **páginas propias** con URL, añadir banner de cookies AEPD y separar consentimientos.
8. Corregir erratas («vehíuclo», «Entedemos», «ofreciéndo», «Si» → «Sí») y eliminar textos de plantilla que mencionan «Dealcar».
9. Normalizar carrocerías y garantía; estructurar el equipamiento a partir de las descripciones.
