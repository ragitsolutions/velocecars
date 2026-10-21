# Licencias y origen de los recursos

## Recursos visuales

| Recurso                                                                                                               | Ubicación                                                                              | Origen                                                 | Licencia / estado                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Logotipo «Veloce Cars» (PNG)                                                                                          | `public/assets/original/logo-*.png`, `public/brand/`                                   | Web actual del cliente (DealCar)                       | Propiedad del cliente. Las versiones de `public/brand/` son recolores/recortes del original. Pendiente vectorial (D4) |
| Fotos de estudio (`propuesta-asesoria.jpg`, `deja-tu-coche.jpg`, `servicios-quieres-vender.jpg`, `contacto-hero.jpg`) | `public/assets/original/`                                                              | Web actual del cliente; matrícula «VELOCECARS» visible | Propiedad del cliente                                                                                                 |
| `hero-home.png`, `servicios-fondo.jpg`                                                                                | `public/assets/original/`                                                              | Web actual                                             | ⚠️ Origen no verificado (D5). **No se usan**                                                                          |
| Iconos `servicio-*.png`                                                                                               | `public/assets/original/`                                                              | Web actual                                             | ⚠️ Probable banco de iconos. **No se usan**                                                                           |
| Fotos de vehículos (2.853)                                                                                            | URLs de DealCar en `data/vehicles.json`; copias en `public/vehicles/` (no versionadas) | Stock del cliente publicado en DealCar                 | Propiedad del cliente (uso autorizado el 20/10/2026)                                                                  |

## Modelo 3D del hero

|                    |                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Obra               | «Car Concept», de los [glTF Sample Assets de Khronos](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept)                                                                                                                                                                                         |
| Autor              | Eric Chadwick, © Darmstadt Graphics Group GmbH (2024). Basado en un modelo de dominio público (CC0) de «Unity Fan»                                                                                                                                                                                                            |
| Licencia           | **CC BY 4.0** — uso comercial permitido **con atribución**                                                                                                                                                                                                                                                                    |
| Atribución         | En el pie de todas las páginas: «Modelo 3D de portada: “Car Concept” de Eric Chadwick (© Darmstadt Graphics Group), licencia CC BY 4.0, modificado», con enlaces a la obra y a la licencia. **No eliminar** mientras se use el modelo                                                                                         |
| Cambios realizados | Variante de pintura fijada; **retirados los logotipos de Khronos y 3D Commerce** (excluidos de la licencia): la matrícula pasa a «VELOCE CARS» y el flanco del neumático queda liso; acabados de materiales ajustados en tiempo de ejecución; texturas a WebP 2048 px y geometría Draco (`scripts/3d/prepare-hero-model.mjs`) |
| Derivados          | Pósteres y vídeos del giro (`public/hero/`) son renders de la escena con este modelo: misma atribución                                                                                                                                                                                                                        |
| Archivo            | `public/models/car.glb` (1,69 MB). El original (11,8 MB) se descarga a `assets-src/`, no versionado                                                                                                                                                                                                                           |

> Se valoró un zip de open3dmodel.com con un Porsche 911 GT2: **descartado**, era un modelo extraído del videojuego _Need for Speed: ProStreet_ (copyright de Electronic Arts).

## Tipografías

| Fuente                                          | Ubicación                                     | Licencia                                                                     |
| ----------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| Archivo (instancia Expanded SemiBold recortada) | `src/styles/fonts/archivo-expanded-600.woff2` | SIL Open Font License 1.1 (`src/styles/fonts/OFL-Archivo.txt`). Omnibus-Type |
| Manrope                                         | `next/font/google` (autoalojada en la build)  | SIL Open Font License 1.1. Mikhail Sharanda                                  |

## Librerías de terceros relevantes

| Librería                                                           | Uso                          | Licencia                                                               |
| ------------------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------- |
| three.js                                                           | Motor 3D                     | MIT                                                                    |
| @react-three/fiber, @react-three/drei, @react-three/postprocessing | Escena 3D en React           | MIT                                                                    |
| postprocessing                                                     | Efectos de imagen            | Zlib                                                                   |
| n8ao                                                               | Oclusión ambiental           | ISC                                                                    |
| Decodificador Draco (`public/draco/`)                              | Descompresión del modelo     | Apache 2.0 (Google), copiado de three.js                               |
| Lenis                                                              | Scroll suave                 | MIT                                                                    |
| Lucide                                                             | Iconos                       | ISC                                                                    |
| Radix UI (Dialog)                                                  | Modales accesibles           | MIT                                                                    |
| Iconos Instagram / TikTok / WhatsApp                               | SVG en línea propios         | Uso nominativo de marcas para enlazar a los perfiles                   |
| React Hook Form, @hookform/resolvers, Zod                          | Formularios y validación     | MIT                                                                    |
| Resend (SDK)                                                       | Envío de emails              | MIT (servicio de pago según volumen)                                   |
| Google Maps (iframe en Contacto)                                   | Mapa                         | Términos de Google Maps; solo se carga con consentimiento o a petición |
| @axe-core/playwright (solo desarrollo)                             | Tests de accesibilidad       | MPL 2.0; no se incluye en la web publicada                             |
| mp4-muxer (solo desarrollo)                                        | Empaquetar el vídeo del hero | MIT; solo lo usa `scripts/3d/render-turntable.mjs`                     |

## Pendiente

| Recurso                              | Estado                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vídeo del hero                       | Hoy es un render del modelo CC BY. Si el cliente graba un coche real en su estudio (D6), sustituye a `public/hero/spin-*.mp4` sin licencias de terceros |
| Modelo 3D de un coche real del stock | Opcional: modelo con licencia comercial o grabación propia (ver pendientes)                                                                             |
