/**
 * Recursos estáticos del hero. Este archivo lo regenera scripts/3d/render-turntable.mjs
 * (póster y secuencia 360° renderizados desde la propia escena 3D). No editar a mano.
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

export const HERO_TURNTABLE = {
  frames: 36,
  landscape: "/hero/turntable/landscape",
  portrait: "/hero/turntable/portrait",
} as const;
