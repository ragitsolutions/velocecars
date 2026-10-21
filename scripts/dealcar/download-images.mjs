#!/usr/bin/env node
/**
 * Replica en local las fotos de los vehículos alojadas en DealCar (Google Cloud Storage).
 *
 *   node scripts/dealcar/download-images.mjs [--concurrency 6] [--max-width 1920]
 *
 * - Guarda cada foto en public/vehicles/{id}/{nn}.webp (máx. 1920 px de ancho, WebP q80).
 * - Actualiza `w`/`h` reales de cada imagen en data/vehicles.json.
 * - Escribe data/image-manifest.json (URL original → ruta local). Con
 *   VEHICLE_IMAGES_SOURCE=local la web sirve estas copias en vez de las de DealCar.
 * - Es reanudable: las fotos ya descargadas no se vuelven a pedir.
 *
 * Las copias no se versionan en git (≈ 2.800 fotos): en producción se suben a un
 * almacenamiento de objetos o CDN (ver docs/despliegue.md).
 */
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DATA = join(ROOT, "data/vehicles.json");
const MANIFEST = join(ROOT, "data/image-manifest.json");
const OUT_DIR = join(ROOT, "public/vehicles");

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? Number(process.argv[i + 1]) : fallback;
};
const CONCURRENCY = arg("concurrency", 6);
const MAX_WIDTH = arg("max-width", 1920);

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );

async function processImage(job, manifest) {
  const { vehicle, image, index } = job;
  const dir = join(OUT_DIR, vehicle.id);
  const file = `${String(index + 1).padStart(2, "0")}.webp`;
  const target = join(dir, file);
  const publicPath = `/vehicles/${vehicle.id}/${file}`;

  if (!(await exists(target))) {
    const res = await fetch(image.src, { headers: { "User-Agent": "VeloceCars-ImageSync/1.0" } });
    if (!res.ok) throw new Error(`${res.status} ${image.src}`);
    await mkdir(dir, { recursive: true });
    await sharp(Buffer.from(await res.arrayBuffer()))
      .rotate() // respeta la orientación EXIF de las fotos de móvil
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(target);
  }
  const meta = await sharp(target).metadata();
  image.w = meta.width ?? image.w;
  image.h = meta.height ?? image.h;
  manifest[image.src] = publicPath;
}

async function main() {
  const vehicles = JSON.parse(await readFile(DATA, "utf8"));
  const manifest = (await exists(MANIFEST)) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
  const jobs = vehicles.flatMap((vehicle) =>
    vehicle.images.map((image, index) => ({ vehicle, image, index })),
  );
  let done = 0;
  let failed = 0;
  const started = Date.now();

  async function worker() {
    while (jobs.length) {
      const job = jobs.shift();
      try {
        await processImage(job, manifest);
      } catch (err) {
        failed++;
        console.warn(`✗ ${err.message}`);
      }
      if (++done % 100 === 0) {
        const s = Math.round((Date.now() - started) / 1000);
        console.log(`${done} fotos procesadas (${s}s)`);
        await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await writeFile(DATA, JSON.stringify(vehicles, null, 2) + "\n");
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`✓ ${done - failed} fotos en public/vehicles · ${failed} errores`);
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
