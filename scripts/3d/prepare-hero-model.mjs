#!/usr/bin/env node
/**
 * Prepara el modelo 3D del hero → public/models/car.glb
 *
 *   node scripts/3d/prepare-hero-model.mjs [--variant "Pearly Swirly"] [--source ruta.glb]
 *
 * Modelo base: «Car Concept», Eric Chadwick / Darmstadt Graphics Group GmbH, CC BY 4.0
 * (glTF Sample Assets de Khronos). Licencia y atribución en docs/licencias-assets.md.
 *
 * Modificaciones (permitidas por CC BY con aviso de cambios):
 *  1. Se fija una variante de pintura (KHR_materials_variants) y se eliminan las demás.
 *  2. Se eliminan los logotipos de Khronos y 3D Commerce, que la licencia excluye:
 *     la matrícula pasa a «VELOCE CARS» y el flanco del neumático queda liso.
 *  3. Texturas a WebP ≤ 2048 px y geometría con Draco para quedar por debajo de 4 MB.
 *
 * Para usar otro coche (p. ej. un escaneo de un vehículo del cliente) basta con pasar
 * --source; los pasos 1-2 se saltan si el modelo no tiene variantes o esos materiales.
 */
import { mkdir, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, draco, prune, textureCompress, weld } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";

const ROOT = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SOURCE_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb";
const DEFAULT_SOURCE = join(ROOT, "assets-src/models/CarConcept.glb");
const OUT = join(ROOT, "public/models/car.glb");
const MAX_BYTES = 4 * 1024 * 1024;

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const VARIANT = arg("variant", "Pearly Swirly");
const SOURCE = arg("source", DEFAULT_SOURCE);
/** 2048 px conserva la oclusión ambiental horneada y el detalle de llantas e interior. */
const MAX_TEXTURE = Number(arg("max-texture", 2048));

async function ensureSource() {
  if (existsSync(SOURCE)) return;
  if (SOURCE !== DEFAULT_SOURCE) throw new Error(`No existe ${SOURCE}`);
  console.log("Descargando modelo base de Khronos glTF Sample Assets…");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Descarga fallida: ${res.status}`);
  await mkdir(join(ROOT, "assets-src/models"), { recursive: true });
  await writeFile(SOURCE, Buffer.from(await res.arrayBuffer()));
}

/** Matrícula negra con «VELOCE CARS» en blanco, misma composición que la textura original. */
function plateImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128">
    <rect width="512" height="128" fill="#0b0b0c"/>
    <rect x="6" y="6" width="500" height="116" fill="none" stroke="#3a3a3e" stroke-width="2"/>
    <text x="256" y="80" text-anchor="middle" fill="#e9ebee"
      font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" letter-spacing="10">VELOCE CARS</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function flatColorLike(image) {
  const { dominant } = await sharp(image).stats();
  const meta = await sharp(image).metadata();
  return sharp({
    create: {
      width: meta.width ?? 256,
      height: meta.height ?? 256,
      channels: 3,
      background: dominant,
    },
  })
    .png()
    .toBuffer();
}

const flatNormal = (size = 64) =>
  sharp({
    create: { width: size, height: size, channels: 3, background: { r: 128, g: 128, b: 255 } },
  })
    .png()
    .toBuffer();

function applyVariant(doc, variantName) {
  const ext = doc
    .getRoot()
    .listExtensionsUsed()
    .find((e) => e.extensionName === "KHR_materials_variants");
  if (!ext) return false;
  let applied = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const mappings = prim.getExtension("KHR_materials_variants");
      if (!mappings) continue;
      for (const mapping of mappings.listMappings()) {
        if (mapping.listVariants().some((v) => v.getName() === variantName)) {
          prim.setMaterial(mapping.getMaterial());
          applied++;
        }
      }
      prim.setExtension("KHR_materials_variants", null);
    }
  }
  ext.dispose();
  return applied > 0;
}

async function removeLogos(doc) {
  const materials = new Map(
    doc
      .getRoot()
      .listMaterials()
      .map((m) => [m.getName(), m]),
  );
  const plate = materials.get("License")?.getBaseColorTexture();
  if (plate) plate.setImage(await plateImage()).setMimeType("image/png");
  const tireside = materials.get("Tireside");
  const sideBase = tireside?.getBaseColorTexture();
  if (sideBase)
    sideBase.setImage(await flatColorLike(sideBase.getImage())).setMimeType("image/png");
  const sideNormal = tireside?.getNormalTexture();
  if (sideNormal) sideNormal.setImage(await flatNormal()).setMimeType("image/png");
  return Boolean(plate || sideBase);
}

async function main() {
  await ensureSource();
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });
  const doc = await io.read(SOURCE);

  if (applyVariant(doc, VARIANT)) console.log(`✓ Variante de pintura: ${VARIANT}`);
  if (await removeLogos(doc)) console.log("✓ Logotipos de terceros eliminados");

  doc.getRoot().getAsset().copyright =
    "«Car Concept» de Eric Chadwick, © Darmstadt Graphics Group GmbH, CC BY 4.0. Modificado por Veloce Cars: variante fijada, logotipos retirados y compresión.";

  await doc.transform(
    dedup(),
    prune(),
    weld(),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [MAX_TEXTURE, MAX_TEXTURE],
      quality: 86,
    }),
    draco({
      method: "edgebreaker",
      quantizePosition: 14,
      quantizeNormal: 10,
      quantizeTexcoord: 12,
    }),
  );

  await mkdir(join(ROOT, "public/models"), { recursive: true });
  await io.write(OUT, doc);
  const { size } = await stat(OUT);
  console.log(`✓ ${OUT} · ${(size / 1024 / 1024).toFixed(2)} MB`);
  if (size > MAX_BYTES) {
    console.error("✗ Supera el presupuesto de 4 MB: reduce el tamaño de las texturas (resize).");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
