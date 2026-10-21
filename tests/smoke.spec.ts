import { expect, test, type Page } from "@playwright/test";
import redirects from "../data/legacy-redirects.json" with { type: "json" };

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
  "/condiciones-de-uso",
  "/vehiculos/comparar",
];

/** Recoge errores de JS, de consola y de hidratación durante la navegación. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

test.describe("rutas principales", () => {
  for (const route of ROUTES) {
    test(`${route} carga sin errores`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(/Veloce Cars/);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      // Sin scroll horizontal en ningún viewport.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  }

  test("404 para rutas inexistentes", async ({ page }) => {
    const res = await page.goto("/no-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("exposición");
  });
});

test.describe("inventario", () => {
  test("lista los vehículos y abre una ficha", async ({ page }) => {
    await page.goto("/vehiculos");
    const cards = page.locator("main article");
    await expect(cards).toHaveCount(12); // PAGE_SIZE
    const firstLink = cards.first().getByRole("link");
    const href = await firstLink.getAttribute("href");
    expect(href).toMatch(/^\/vehiculos\/[a-z0-9-]+\/[a-z0-9-]+$/);
    await page.goto(href!);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(/€/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ficha técnica" })).toBeVisible();
  });
});

test.describe("redirecciones 301 de la web anterior", () => {
  const [legacyVehicle, target] = Object.entries(redirects as Record<string, string>)[0]!;
  const cases: [string, string][] = [
    ["/buy", "/vehiculos"],
    ["/sell", "/vendemos-tu-coche"],
    ["/services", "/servicios"],
    ["/contact", "/contacto"],
    ["/financing", "/financiacion"],
    [legacyVehicle, target],
  ];
  for (const [from, to] of cases) {
    test(`${from} → ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(301);
      expect(new URL(res.headers()["location"]!, "http://x").pathname).toBe(to);
    });
  }
});

test.describe("consentimiento de cookies (AEPD)", () => {
  test("muestra el banner, permite rechazar y reabrir la configuración", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    const banner = page.getByTestId("cookie-banner");
    await expect(banner).toBeVisible();
    // Aceptar, rechazar y configurar al mismo nivel.
    for (const name of ["Aceptar", "Rechazar", "Configurar"]) {
      await expect(banner.getByRole("button", { name })).toBeVisible();
    }
    await banner.getByRole("button", { name: "Rechazar" }).click();
    await expect(banner).toBeHidden();

    const consent = (await context.cookies()).find((c) => c.name === "vc_consent");
    expect(consent).toBeDefined();
    expect(JSON.parse(decodeURIComponent(consent!.value))).toMatchObject({
      analytics: false,
      marketing: false,
    });

    // No se cargan scripts de analítica sin consentimiento.
    expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0);

    await page.getByRole("button", { name: "Configurar cookies" }).click();
    await expect(page.getByTestId("cookie-settings")).toBeVisible();
  });
});

test.describe("navegación", () => {
  test("menú móvil", async ({ page, isMobile }) => {
    test.skip(!isMobile, "solo móvil");
    await page.goto("/");
    // Un clic antes de hidratar se pierde.
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    await page.getByTestId("mobile-menu-trigger").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: /Servicios/ }).click();
    await expect(page).toHaveURL(/\/servicios$/);
  });

  test("megamenú de marcas", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "solo escritorio");
    await page.goto("/");
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    await page.getByRole("button", { name: "Abrir menú de marcas" }).click();
    const menu = page.locator("#megamenu-vehiculos");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: /Porsche/ }).click();
    await expect(page).toHaveURL(/\/vehiculos\/porsche$/);
  });

  test("enlace para saltar al contenido", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "teclado");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  });
});

test.describe("home (Fase 2)", () => {
  test("hero: el póster se pinta primero y el giro llega como vídeo", async ({ page }) => {
    await page.goto("/");
    const poster = page.locator("[data-hero] picture img");
    await expect(poster).toBeVisible();
    await expect(poster).toHaveAttribute("fetchpriority", "high");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Coches de\s*alta gama/);
    // El Chromium de Playwright no trae H.264: se comprueba el montaje, no la reproducción.
    const video = page.locator("[data-hero] video");
    await expect(video).toHaveAttribute("src", /\/hero\/spin-(landscape|portrait)\.mp4$/, {
      timeout: 10_000,
    });
    await expect(video).toHaveAttribute("playsinline", "");
    await expect(video).toHaveAttribute("loop", "");
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  });

  test("hero: con movimiento reducido solo se muestra el póster", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-hero-mode='static']")).toBeAttached();
    await page.waitForTimeout(3000);
    expect(await page.locator("[data-hero] video").count()).toBe(0);
    await context.close();
  });

  test("secciones, buscador y datos estructurados", async ({ page }) => {
    await page.goto("/");
    for (const name of [
      "Nuestro stock",
      "Deja tu coche en nuestras manos",
      "Todo el proceso, en una sola mano",
      "Resolvemos tus dudas",
      "Ven a visitarnos",
    ]) {
      await expect(page.getByRole("heading", { name, exact: false }).first()).toBeAttached();
    }
    // El buscador del hero lleva al inventario filtrado.
    await page.getByRole("searchbox", { name: "Buscar vehículo" }).fill("911");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/\/vehiculos\?q=911/);
    await page.goBack();
    await expect(page.locator("section[aria-labelledby='stock-title'] article")).toHaveCount(9);
    const faqLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(faqLd.some((t) => t.includes('"FAQPage"'))).toBe(true);
    // Crédito obligatorio de la licencia CC BY del modelo 3D.
    await expect(page.getByRole("contentinfo")).toContainText("CC BY 4.0");
  });
});

test("con consentimiento guardado el banner de cookies no se muestra", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "vc_consent",
      value: encodeURIComponent(
        JSON.stringify({
          version: 1,
          date: new Date().toISOString(),
          analytics: false,
          marketing: false,
        }),
      ),
      url: "http://localhost:3100",
    },
  ]);
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/vc-consented/);
  await expect(page.getByTestId("cookie-banner")).toBeHidden();
});
