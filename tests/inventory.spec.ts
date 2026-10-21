import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

const cardLinks = (page: Page) =>
  page
    .locator("main article")
    .evaluateAll((els) => els.map((el) => el.querySelector("a")?.getAttribute("href") ?? ""));

const euros = (text: string) => Number(text.match(/([\d.]+)\s?€/)?.[1]?.replace(/\./g, ""));

test.describe("inventario", () => {
  test("los filtros viven en la URL y se pueden compartir", async ({ page }) => {
    await page.goto("/vehiculos?marca=porsche&orden=precio-asc");
    const hrefs = await cardLinks(page);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toMatch(/^\/vehiculos\/porsche\//);
    await expect(page.getByRole("button", { name: /Quitar filtro Porsche/ })).toBeVisible();

    const prices = await page
      .locator("main article")
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).innerText));
    const values = prices.map(euros);
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  test("marcar una marca actualiza resultados y URL", async ({ page, isMobile }) => {
    test.skip(isMobile, "En móvil los filtros están en un panel (cubierto por el test siguiente)");
    const errors = trackErrors(page);
    await page.goto("/vehiculos");
    // Con varios navegadores en paralelo el scroll suave puede mover la casilla durante el
    // clic; se reintenta hasta que quede marcada.
    const bmw = page.getByRole("checkbox", { name: /^BMW/ });
    await expect(async () => {
      if (!(await bmw.isChecked())) await bmw.click();
      await expect(bmw).toBeChecked({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect(page).toHaveURL(/marca=bmw/);
    await expect(page.getByRole("button", { name: /Quitar filtro BMW/ })).toBeVisible();
    await expect
      .poll(async () => (await cardLinks(page)).every((href) => href.startsWith("/vehiculos/bmw/")))
      .toBe(true);
    await page.getByRole("button", { name: /Quitar filtro BMW/ }).click();
    await expect(page).not.toHaveURL(/marca=/);
    expect(errors).toEqual([]);
  });

  test("panel de filtros en móvil", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Solo móvil");
    await page.goto("/vehiculos");
    await page.getByRole("button", { name: /Filtros/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("checkbox", { name: /^BMW/ }).check();
    await expect(page).toHaveURL(/marca=bmw/);
    await dialog.getByRole("button", { name: "Cerrar filtros" }).click();
    await expect(dialog).toBeHidden();
  });

  test("vista en lista", async ({ page, isMobile }) => {
    test.skip(isMobile, "El selector de vista solo se muestra desde tableta");
    await page.goto("/vehiculos?vista=lista");
    await expect(page.getByRole("button", { name: "Vista en lista" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("búsqueda sin resultados muestra estado vacío", async ({ page }) => {
    await page.goto("/vehiculos?q=zzzzzz");
    await expect(page.locator("main article")).toHaveCount(0);
    await expect(page.getByText("Ningún vehículo coincide")).toBeVisible();
  });
});

test.describe("comparador y favoritos", () => {
  test("añadir dos vehículos y compararlos", async ({ page }) => {
    await page.goto("/vehiculos");
    const cards = page.locator("main article");
    await cards
      .nth(0)
      .getByRole("button", { name: /Añadir .* al comparador/ })
      .click();
    await cards
      .nth(1)
      .getByRole("button", { name: /Añadir .* al comparador/ })
      .click();
    const tray = page.getByRole("complementary", { name: "Comparador de vehículos" });
    await expect(tray).toBeVisible();
    await tray.getByRole("link", { name: /Comparar \(2\)/ }).click();
    await expect(page).toHaveURL(/\/vehiculos\/comparar\?ids=/);
    await expect(page.locator("table thead th")).toHaveCount(2);
  });

  test("favoritos se guardan y sobreviven a una recarga", async ({ page }) => {
    await page.goto("/vehiculos");
    const fav = page
      .locator("main article")
      .first()
      .getByRole("button", { name: /Guardar .* en favoritos/ });
    await fav.click();
    await page.reload();
    await expect(
      page
        .locator("main article")
        .first()
        .getByRole("button", { name: /Quitar .* de favoritos/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /Favoritos/ }).click();
    await expect(page.getByRole("dialog").locator("li")).toHaveCount(1);
  });
});

test.describe("ficha de vehículo", () => {
  const openFirstVehicle = async (page: Page) => {
    await page.goto("/vehiculos");
    const [href] = await cardLinks(page);
    await page.goto(href!);
  };

  test("galería con visor a pantalla completa", async ({ page }) => {
    const errors = trackErrors(page);
    await openFirstVehicle(page);
    await page.getByRole("button", { name: /Abrir galería de/ }).click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText(/^1 \/ \d+$/)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText(/^2 \/ \d+$/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
    expect(errors).toEqual([]);
  });

  test("datos estructurados, migas y secciones", async ({ page }) => {
    await openFirstVehicle(page);
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")["@type"]));
    expect(types).toEqual(expect.arrayContaining(["Car", "BreadcrumbList"]));
    await expect(page.getByRole("navigation", { name: "Migas de pan" })).toBeVisible();
    for (const name of [
      "Ficha técnica",
      "Equipamiento",
      "Calcula tu cuota",
      "Solicitar información",
    ]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
  });

  test("calculadora: cambiar el plazo cambia la cuota", async ({ page }) => {
    await openFirstVehicle(page);
    const section = page.locator("section", {
      has: page.getByRole("heading", { name: "Calcula tu cuota" }),
    });
    const quota = section.locator('[aria-live="polite"]').first();
    const before = await quota.innerText();
    await section.getByText("84 meses").click();
    await expect(quota).not.toHaveText(before);
  });

  test("formulario: valida, exige privacidad y envía", async ({ page }) => {
    // Sin RESEND_API_KEY la API real no envía emails: se simula la respuesta.
    await page.route("**/api/contact", (route) => route.fulfill({ json: { ok: true } }));
    await openFirstVehicle(page);
    const form = page.getByTestId("contact-form");
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(form.getByText("Indica tu nombre")).toBeVisible();
    await expect(form.getByText("Debes aceptar la política de privacidad")).toBeVisible();
    // Los consentimientos empiezan sin marcar.
    await expect(form.getByRole("checkbox", { name: /política de privacidad/ })).not.toBeChecked();
    await expect(form.getByRole("checkbox", { name: /novedades/ })).not.toBeChecked();

    await form.getByRole("textbox", { name: "Nombre" }).fill("Prueba");
    await form.getByRole("textbox", { name: "Email" }).fill("prueba@example.com");
    await form.getByRole("textbox", { name: "Teléfono" }).fill("600 000 000");
    await form.getByRole("checkbox", { name: /política de privacidad/ }).check();
    await form.getByRole("button", { name: "Enviar solicitud" }).click();
    await expect(page.getByText("Mensaje enviado")).toBeVisible();
  });
});

test.describe("API de contacto", () => {
  test("rechaza datos no válidos", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { topic: "general", name: "A", email: "x", privacy: false },
    });
    expect(res.status()).toBe(400);
  });

  test("honeypot: responde ok sin enviar", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: {
        topic: "general",
        name: "Bot",
        email: "bot@example.com",
        phone: "600000000",
        message: "Mensaje automático",
        preferredContact: "email",
        privacy: true,
        marketing: false,
        website: "https://spam.example",
      },
    });
    expect(res.status()).toBe(200);
  });
});
