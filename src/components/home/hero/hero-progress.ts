/**
 * Estado mutable compartido con la escena 3D (se lee en cada fotograma sin renders de React).
 * `progress` queda a 0: el efecto de scroll del hero se retiró a petición del cliente (21/10/2026);
 * la cámara lo sigue admitiendo por si se recupera.
 */
export const heroState = {
  /** 0 → cámara en reposo · 1 → cámara alejada. */
  progress: 0,
  /** Puntero normalizado [-1, 1] para el parallax de cámara. */
  pointer: { x: 0, y: 0 },
};
