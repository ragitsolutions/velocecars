/**
 * Pre-commit (husky → lint-staged). Con muchos archivos, Windows rechaza la línea de comandos
 * («demasiado larga»): a partir de 40 archivos se comprueba el proyecto entero en su lugar
 * (cada patrón con su propio glob: lint-staged ejecuta los patrones en paralelo).
 */
const MAX_FILES = 40;
const quote = (files) => files.map((f) => `"${f}"`).join(" ");

const config = {
  "*.{ts,tsx,mjs,js}": (files) =>
    files.length > MAX_FILES
      ? ["eslint . --max-warnings 0 --fix", 'prettier --write "**/*.{ts,tsx,mjs,js}"']
      : [`eslint --max-warnings 0 --fix ${quote(files)}`, `prettier --write ${quote(files)}`],
  "*.{css,md,json}": (files) =>
    files.length > MAX_FILES
      ? 'prettier --write "**/*.{css,md,json}"'
      : `prettier --write ${quote(files)}`,
};

export default config;
