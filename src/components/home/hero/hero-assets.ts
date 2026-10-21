/**
 * Recursos estáticos del hero. Este archivo lo regenera scripts/3d/render-turntable.mjs
 * (póster y vídeo del giro renderizados desde la propia escena 3D). No editar a mano.
 */
export const HERO_POSTER = {
  landscape: {
    src: "/hero/poster-landscape.webp",
    width: 1920,
    height: 1080,
    blurDataURL:
      "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACQAwCdASoYAA4APu1yrU+pp6QiMAgBMB2JaQAAW+snjFRfZwAAAP70GxXiarBGYdU/P9ydGWD27DMevuSfq+P5njurIAAA",
  },
  portrait: {
    src: "/hero/poster-portrait.webp",
    width: 1080,
    height: 1920,
    blurDataURL:
      "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAwCdASoYACsAPu1wr1EppqQiqqgBMB2JaQAAPY/n03pO91N/QAD+9Bn4x0qwukFclRjkuaHVcTBKEOv7GsN5ObrxjD5ecBXWd7s6gnszm/bh8FpBcAAA",
  },
} as const;

/** Una vuelta completa en bucle (20 s a 24 fps), H.264 en MP4. */
export const HERO_VIDEO = {
  landscape: {
    src: "/hero/spin-landscape.mp4",
    width: 1280,
    height: 720,
  },
  portrait: {
    src: "/hero/spin-portrait.mp4",
    width: 720,
    height: 1280,
  },
} as const;
