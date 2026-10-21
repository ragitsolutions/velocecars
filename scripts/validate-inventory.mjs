/**
 * Comprueba data/vehicles.json con el mismo esquema que usa la web al cargarlo
 * (src/lib/inventory/schema.ts). Ejecutar tras editar el inventario a mano:
 *   npm run inventory:validate
 */
import { readFile } from "node:fs/promises";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { vehiclesFileSchema } = await jiti.import("../src/lib/inventory/schema.ts");

const raw = JSON.parse(await readFile(new URL("../data/vehicles.json", import.meta.url), "utf8"));
const result = vehiclesFileSchema.safeParse(raw);

if (!result.success) {
  console.error("✗ data/vehicles.json tiene errores:\n");
  for (const issue of result.error.issues) {
    const [index, ...field] = issue.path;
    const v = typeof index === "number" ? raw[index] : undefined;
    const name = v
      ? `${v.brand ?? "?"} ${v.model ?? "?"} (${v.id ?? `posición ${index}`})`
      : "archivo";
    console.error(`  · ${name} → ${field.join(".") || "(vehículo)"}: ${issue.message}`);
  }
  process.exit(1);
}

const byStatus = Object.groupBy(result.data, (v) => v.status);
console.log(
  `✓ ${result.data.length} vehículos válidos (${Object.entries(byStatus)
    .map(([k, list]) => `${list.length} ${k}`)
    .join(", ")}).`,
);
