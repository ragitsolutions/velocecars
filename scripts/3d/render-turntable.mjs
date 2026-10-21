#!/usr/bin/env node
/**
 * Renderiza, desde la escena 3D real, los recursos estáticos del hero:
 *   - public/hero/poster-{landscape,portrait}.webp  (póster / LCP, fotograma 0)
 *   - public/hero/turntable/{landscape,portrait}/00..35.webp  (secuencia 360° del fallback)
 *   - src/components/home/hero/hero-assets.ts  (rutas, tamaños y blurDataURL)
 *
 * Uso (con la web arrancada con la herramienta habilitada):
 *   RENDER_TOOLS=1 npm run dev          # en otra terminal
 *   node scripts/3d/render-turntable.mjs [--url http://localhost:3000] [--frames 36]
 *
 * Volver a ejecutarlo cada vez que cambie el modelo o la iluminación de la escena.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const ROOT = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const BASE = arg("url", "http://localhost:3000");
const FRAMES = Number(arg("frames", 36));

const FORMATS = {
  landscape: { viewport: { width: 1600, height: 900 }, poster: { width: 1920, height: 1080 } },
  portrait: { viewport: { width: 540, height: 960 }, poster: { width: 1080, height: 1920 } },
};

const pad = (n) => String(n).padStart(2, "0");

async function renderFormat(browser, name, { viewport, poster }) {
  // Se renderiza al tamaño del póster (deviceScaleFactor) para que tenga nitidez en pantallas grandes.
  const scale = poster.width / viewport.width;
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  await page.goto(`${BASE}/render/turntable`, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => document.documentElement.dataset.turntableReady === "true",
    null,
    {
      timeout: 120_000,
    },
  );
  const canvas = page.locator("canvas");
  const dir = join(ROOT, "public/hero/turntable", name);
  await mkdir(dir, { recursive: true });

  let posterBuffer;
  for (let i = 0; i < FRAMES; i++) {
    await page.evaluate((deg) => window.__veloceTurntable.setAngle(deg), (360 / FRAMES) * i);
    const png = await canvas.screenshot({ type: "png" });
    if (i === 0) posterBuffer = png;
    // La secuencia va a la mitad de resolución que el póster: se ve en movimiento.
    await sharp(png)
      .resize({ width: Math.round(poster.width * (name === "landscape" ? 0.67 : 0.72)) })
      .webp({ quality: 72 })
      .toFile(join(dir, `${pad(i)}.webp`));
    process.stdout.write(`\r${name}: ${i + 1}/${FRAMES}`);
  }
  process.stdout.write("\n");
  await page.close();

  const posterPath = join(ROOT, "public/hero", `poster-${name}.webp`);
  await sharp(posterBuffer).resize(poster).webp({ quality: 82 }).toFile(posterPath);
  const blur = await sharp(posterBuffer).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  return {
    src: `/hero/poster-${name}.webp`,
    width: poster.width,
    height: poster.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

async function main() {
  // GPU real si existe (calidad y velocidad); --cpu fuerza el renderizado por software.
  const args = process.argv.includes("--cpu")
    ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
    : ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"];
  const browser = await chromium.launch({ args });
  const assets = {};
  for (const [name, cfg] of Object.entries(FORMATS)) {
    assets[name] = await renderFormat(browser, name, cfg);
  }
  await browser.close();

  const file = `/**
 * Recursos estáticos del hero. Este archivo lo regenera scripts/3d/render-turntable.mjs
 * (póster y secuencia 360° renderizados desde la propia escena 3D). No editar a mano.
 */
export const HERO_POSTER = ${JSON.stringify(assets, null, 2)} as const;

export const HERO_TURNTABLE = {
  frames: ${FRAMES},
  landscape: "/hero/turntable/landscape",
  portrait: "/hero/turntable/portrait",
} as const;
`;
  await writeFile(join(ROOT, "src/components/home/hero/hero-assets.ts"), file);
  console.log("✓ Póster, secuencia y hero-assets.ts generados");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
