/**
 * Lighthouse CI (móvil, sin caché) con los umbrales del proyecto (§11 del briefing).
 * Uso: `npm run build && npm run lhci` (levanta `next start` en el puerto 3100).
 * El rendimiento queda como aviso: está en 90–96, pero varía ±2 puntos entre ejecuciones;
 * ver docs/despliegue.md §6.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npx next start -p 3100",
      startServerReadyPattern: "Ready",
      url: [
        "http://localhost:3100/",
        "http://localhost:3100/vehiculos",
        "http://localhost:3100/vehiculos/porsche",
        "http://localhost:3100/vendemos-tu-coche",
        "http://localhost:3100/contacto",
        "http://localhost:3100/financiacion",
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
