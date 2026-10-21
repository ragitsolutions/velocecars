#!/usr/bin/env node
/**
 * Renderiza, desde la escena 3D real, los recursos del hero de la portada:
 *   - public/hero/poster-{landscape,portrait}.webp  (póster / LCP: fotograma 0)
 *   - public/hero/spin-{landscape,portrait}.mp4  (vídeo en bucle de una vuelta completa)
 *   - src/components/home/hero/hero-assets.ts  (rutas, tamaños y blurDataURL)
 *
 * El hero muestra el giro como vídeo en lugar de cargar Three.js en el navegador: el mismo
 * coche y la misma luz, ~0,85 MB que cualquier móvil decodifica por hardware, frente a ~2,5 MB
 * de escena 3D que tardaba en arrancar y en algunos móviles no llegaba a moverse.
 *
 * El vídeo se codifica en el propio Chrome con WebCodecs (H.264 con calidad constante) y se
 * empaqueta en MP4 con mp4-muxer. Hace falta Google Chrome instalado (Chromium no codifica
 * H.264). Se probó también VP9/WebM: el codificador del navegador funciona en tiempo real y
 * con calidad constante pesaba 4–6 MB; con bitrate, el primer fotograma salía emborronado.
 *
 * Uso (con la web arrancada con la herramienta habilitada; vale `next start`):
 *   RENDER_TOOLS=1 npm run dev          # en otra terminal
 *   node scripts/3d/render-turntable.mjs [--url http://localhost:3000] [--seconds 20] [--fps 24]
 *                                        [--avc-q 32]
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
/** Una vuelta completa; el mismo ritmo que tenía la escena 3D (SECONDS_PER_TURN). */
const SECONDS = Number(arg("seconds", 20));
const FPS = Number(arg("fps", 24));
/**
 * Calidad constante (modo «quantizer» de WebCodecs, 0–51; más alto = más ligero): mismo nivel en
 * todos los fotogramas y el fondo negro casi no gasta bits. Con control de bitrate el primer
 * fotograma (el del relevo con el póster) salía emborronado.
 */
// 32: ~0,85 MB por vídeo. 30 conservaba algo más de detalle con 1,2 MB; 34 (650 KB) ya emborronaba
// llantas y pinzas de freno.
const AVC_Q = Number(arg("avc-q", 32));
/** Si el codificador H.264 del equipo no admite calidad constante (bps). */
const AVC_BITRATE = Number(arg("avc-bitrate", 650_000));

const FORMATS = {
  landscape: {
    poster: { viewport: { width: 1600, height: 900 }, width: 1920, height: 1080 },
    video: { width: 1280, height: 720 },
  },
  portrait: {
    poster: { viewport: { width: 540, height: 960 }, width: 1080, height: 1920 },
    video: { width: 720, height: 1280 },
  },
};

async function openScene(browser, viewport, deviceScaleFactor) {
  const page = await browser.newPage({ viewport, deviceScaleFactor });
  await page.goto(`${BASE}/render/turntable`, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => document.documentElement.dataset.turntableReady === "true",
    null,
    {
      timeout: 120_000,
    },
  );
  return page;
}

async function renderPoster(browser, name, { viewport, width, height }) {
  // Se renderiza al tamaño del póster (deviceScaleFactor) para que tenga nitidez en pantallas grandes.
  const page = await openScene(browser, viewport, width / viewport.width);
  await page.evaluate(() => window.__veloceTurntable.setAngle(0));
  const png = await page.locator("canvas").screenshot({ type: "png" });
  await page.close();

  await sharp(png)
    .resize({ width, height })
    .webp({ quality: 82 })
    .toFile(join(ROOT, "public/hero", `poster-${name}.webp`));
  const blur = await sharp(png).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  return {
    src: `/hero/poster-${name}.webp`,
    width,
    height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

async function renderVideo(browser, name, video) {
  const page = await openScene(browser, { width: video.width, height: video.height }, 1);
  await page.addScriptTag({ path: join(ROOT, "node_modules/mp4-muxer/build/mp4-muxer.js") });
  page.on(
    "console",
    (m) => m.type() === "log" && process.stdout.write(`\r${name}: ${m.text()}   `),
  );

  const base64 = await page.evaluate(
    async ({ frames, fps, avcQ, avcBitrate }) => {
      const canvas = document.querySelector("canvas");
      const { width, height } = canvas;
      const base = { codec: "avc1.4d0028", width, height, framerate: fps, avc: { format: "avc" } };
      // Calidad constante si el codificador la admite; si no, bitrate con el de software (el de
      // hardware de Windows no respeta el bitrate pedido).
      const options = [
        { ...base, bitrateMode: "quantizer", hardwareAcceleration: "prefer-hardware" },
        { ...base, bitrateMode: "quantizer", hardwareAcceleration: "prefer-software" },
        { ...base, bitrate: avcBitrate, hardwareAcceleration: "prefer-software" },
      ];
      let config;
      for (const cfg of options) {
        if ((await VideoEncoder.isConfigSupported(cfg)).supported) {
          config = cfg;
          break;
        }
      }
      if (!config) throw new Error("Este navegador no codifica H.264");
      const quantizer = config.bitrateMode === "quantizer";

      const muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: "avc", width, height, frameRate: fps },
        fastStart: "in-memory",
      });
      let failure;
      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => (failure = e),
      });
      encoder.configure(config);

      // Fotogramas 0..N-1 de una vuelta: el bucle empalma sin salto (N equivaldría al 0).
      for (let i = 0; i < frames; i++) {
        await window.__veloceTurntable.setAngle((360 * i) / frames);
        const frame = new VideoFrame(canvas, {
          timestamp: Math.round((i * 1e6) / fps),
          duration: Math.round(1e6 / fps),
        });
        // Pocos fotogramas clave (cada 10 s): el bucle no se rebobina a mano y pesan mucho.
        const keyFrame = i % (fps * 10) === 0;
        encoder.encode(frame, quantizer ? { keyFrame, avc: { quantizer: avcQ } } : { keyFrame });
        frame.close();
        while (encoder.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 5));
        if (failure) throw failure;
        if (i % 12 === 0) console.log(`${i + 1}/${frames}`);
      }
      await encoder.flush();
      muxer.finalize();

      const bytes = new Uint8Array(muxer.target.buffer);
      let s = "";
      for (let i = 0; i < bytes.length; i += 0x8000) {
        s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      return btoa(s);
    },
    { frames: SECONDS * FPS, fps: FPS, avcQ: AVC_Q, avcBitrate: AVC_BITRATE },
  );
  await page.close();
  process.stdout.write("\n");

  const buffer = Buffer.from(base64, "base64");
  await writeFile(join(ROOT, "public/hero", `spin-${name}.mp4`), buffer);
  console.log(`  spin-${name}.mp4: ${(buffer.length / 1024).toFixed(0)} KB`);
  return { src: `/hero/spin-${name}.mp4`, width: video.width, height: video.height };
}

async function main() {
  // Chrome instalado (codifica H.264) con la GPU real; --cpu fuerza el renderizado por software.
  const args = process.argv.includes("--cpu")
    ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
    : ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"];
  const browser = await chromium.launch({ channel: "chrome", args });
  await mkdir(join(ROOT, "public/hero"), { recursive: true });
  const posters = {};
  const videos = {};
  for (const [name, cfg] of Object.entries(FORMATS)) {
    posters[name] = await renderPoster(browser, name, cfg.poster);
    videos[name] = await renderVideo(browser, name, cfg.video);
  }
  await browser.close();

  const file = `/**
 * Recursos estáticos del hero. Este archivo lo regenera scripts/3d/render-turntable.mjs
 * (póster y vídeo del giro renderizados desde la propia escena 3D). No editar a mano.
 */
export const HERO_POSTER = ${JSON.stringify(posters, null, 2)} as const;

/** Una vuelta completa en bucle (${SECONDS} s a ${FPS} fps), H.264 en MP4. */
export const HERO_VIDEO = ${JSON.stringify(videos, null, 2)} as const;
`;
  await writeFile(join(ROOT, "src/components/home/hero/hero-assets.ts"), file);
  console.log("✓ Pósteres, vídeos y hero-assets.ts generados");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
