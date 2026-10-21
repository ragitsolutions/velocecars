import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const ROUTES = [
  "/",
  "/vehiculos",
  "/vehiculos/porsche",
  "/vendemos-tu-coche",
  "/servicios",
  "/financiacion",
  "/nosotros",
  "/contacto",
  "/aviso-legal",
  "/politica-privacidad",
  "/politica-cookies",
];

test.describe("accesibilidad (axe, WCAG 2.1 AA)", () => {
  test.skip(({ isMobile }) => isMobile, "Basta con un viewport: el marcado es el mismo");
  // Con movimiento reducido el contenido se muestra sin esperar a las animaciones de entrada.
  test.use({ reducedMotion: "reduce" });

  const check = async (page: import("@playwright/test").Page) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Los marcadores [[PENDIENTE]] son provisionales y desaparecen al rellenarse.
      .exclude(".pending-marker")
      .analyze();
    expect(
      violations.map(
        (v) =>
          `${v.id}: ${v.help} (${v.nodes
            .map((n) => n.target.join(" "))
            .slice(0, 3)
            .join(" | ")})`,
      ),
    ).toEqual([]);
  };

  for (const route of ROUTES) {
    test(route, async ({ page }) => {
      await page.goto(route);
      await check(page);
    });
  }

  test("ficha de vehículo", async ({ page }) => {
    await page.goto("/vehiculos");
    const href = await page.locator("main article a").first().getAttribute("href");
    await page.goto(href!);
    await check(page);
  });
});

test.describe("teclado", () => {
  test.skip(({ isMobile }) => isMobile, "Navegación por teclado en escritorio");

  test("saltar al contenido y foco visible", async ({ page }) => {
    await page.goto("/vehiculos");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("#contenido")).toBeFocused();
  });

  test("el visor de fotos se maneja con teclado y devuelve el foco", async ({ page }) => {
    await page.goto("/vehiculos");
    const href = await page.locator("main article a").first().getAttribute("href");
    await page.goto(href!);
    const opener = page.getByRole("button", { name: /Abrir galería de/ });
    await opener.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("los filtros se pueden usar con teclado", async ({ page }) => {
    await page.goto("/vehiculos");
    const bmw = page.getByRole("checkbox", { name: /^BMW/ });
    await bmw.focus();
    await page.keyboard.press("Space");
    await expect(page).toHaveURL(/marca=bmw/);
  });
});

test("con movimiento reducido no hay contenido oculto esperando animaciones", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce", baseURL });
  const page = await context.newPage();
  await page.goto("/servicios");
  const hidden = await page.evaluate(
    () =>
      [...document.querySelectorAll("main h2, main h3, main p")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && Number(getComputedStyle(el).opacity) < 0.5;
      }).length,
  );
  expect(hidden).toBe(0);
  await context.close();
});
