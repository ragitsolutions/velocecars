/**
 * Estado de interfaz del inventario que debe sobrevivir a un remontaje. `/vehiculos` (estática)
 * y su versión filtrada son rutas internas distintas (src/middleware.ts): al aplicar el primer
 * filtro React monta un árbol nuevo y, sin esto, se cerraría el panel de filtros del móvil,
 * el lateral volvería arriba y se perdería la animación de reordenación.
 */
export const persistedUi: {
  mobileFiltersOpen: boolean;
  mobileFiltersScroll: number;
  sidebarScroll: number;
  sidebarShown: boolean;
  positions: Map<string, { x: number; y: number }> | null;
  /** Hay un cambio de filtros en curso (lo marca inventory-context antes de navegar). */
  filtering: boolean;
} = {
  mobileFiltersOpen: false,
  mobileFiltersScroll: 0,
  sidebarScroll: 0,
  sidebarShown: false,
  positions: null,
  filtering: false,
};
