import { expect, test } from "./fixtures";

test.describe("vendemos tu coche", () => {
  test("tasación en 3 pasos: valida cada paso y envía", async ({ page }) => {
    await page.route("**/api/valuation", (route) => route.fulfill({ json: { ok: true } }));
    await page.goto("/vendemos-tu-coche");
    const form = page.getByTestId("valuation-form");
    const progress = form.getByRole("progressbar");
    await expect(progress).toHaveAttribute("aria-valuenow", "1");

    await form.getByRole("button", { name: "Siguiente" }).click();
    await expect(form.getByText("Indica la marca")).toBeVisible();
    await form.getByRole("combobox", { name: "Marca" }).fill("Porsche");
    await form.getByRole("textbox", { name: "Modelo" }).fill("911");
    await form.getByRole("spinbutton", { name: "Año de matriculación" }).fill("2019");
    await form.getByRole("button", { name: "Siguiente" }).click();
    await expect(progress).toHaveAttribute("aria-valuenow", "2");

    await form.getByRole("spinbutton", { name: "Kilómetros" }).fill("45000");
    await form.getByRole("combobox", { name: "Combustible" }).selectOption("Gasolina");
    await form.getByRole("combobox", { name: "Cambio" }).selectOption("Automático");
    await form.getByText("Muy bueno", { exact: true }).click();
    await form.getByRole("button", { name: "Siguiente" }).click();
    await expect(progress).toHaveAttribute("aria-valuenow", "3");

    // El progreso se conserva al recargar.
    await page.reload();
    await expect(page.getByTestId("valuation-form").getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "3",
    );

    const f = page.getByTestId("valuation-form");
    await f.getByRole("textbox", { name: "Nombre" }).fill("Prueba");
    await f.getByRole("textbox", { name: "Email" }).fill("prueba@example.com");
    await f.getByRole("textbox", { name: "Teléfono" }).fill("600000000");
    await expect(f.getByRole("checkbox", { name: /política de privacidad/ })).not.toBeChecked();
    await f.getByRole("checkbox", { name: /política de privacidad/ }).check();
    await f.getByRole("button", { name: "Solicitar tasación" }).click();
    await expect(page.getByText("Solicitud de tasación recibida")).toBeVisible();
  });
});

test.describe("contacto y cita previa", () => {
  test("la cita llega precargada con el vehículo desde la ficha", async ({ page }) => {
    await page.goto("/vehiculos");
    const href = await page.locator("main article a").first().getAttribute("href");
    await page.goto(href!);
    const citaHref = await page
      .locator('a[href^="/contacto?vehiculo="]')
      .first()
      .getAttribute("href");
    await page.goto(citaHref!);
    const select = page.getByTestId("appointment-form").getByRole("combobox", { name: "Vehículo" });
    await expect(select).not.toHaveValue("");
  });

  test("valida la cita y la envía", async ({ page }) => {
    await page.route("**/api/appointment", (route) => route.fulfill({ json: { ok: true } }));
    await page.goto("/contacto?motivo=tasacion");
    const form = page.getByTestId("appointment-form");
    await expect(form.getByRole("radio", { name: "Tasación de mi coche" })).toBeChecked();
    await form.getByRole("button", { name: "Solicitar cita" }).click();
    await expect(form.getByText("Elige una franja")).toBeVisible();

    const tomorrow = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);
    await form.getByLabel("Fecha").fill(tomorrow);
    await form.getByText("Tarde", { exact: true }).click();
    await form.getByRole("textbox", { name: "Nombre" }).fill("Prueba");
    await form.getByRole("textbox", { name: "Email" }).fill("prueba@example.com");
    await form.getByRole("textbox", { name: "Teléfono" }).fill("600000000");
    await form.getByRole("checkbox", { name: /política de privacidad/ }).check();
    await form.getByRole("button", { name: "Solicitar cita" }).click();
    await expect(page.getByText("Solicitud de cita recibida")).toBeVisible();
  });

  test("el mapa de Google no se carga sin consentimiento", async ({ page }) => {
    await page.goto("/contacto");
    await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(0);
    await page.getByRole("button", { name: "Cargar mapa" }).click();
    await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);
  });

  test("API de cita rechaza fechas pasadas", async ({ request }) => {
    const res = await request.post("/api/appointment", {
      data: {
        reason: "asesoramiento",
        date: "2020-01-01",
        slot: "manana",
        name: "Prueba",
        email: "prueba@example.com",
        phone: "600000000",
        privacy: true,
        marketing: false,
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("financiación", () => {
  test("calculadora y formulario de estudio", async ({ page }) => {
    await page.goto("/financiacion");
    await expect(page.getByRole("heading", { name: "Calcula tu cuota" })).toBeVisible();
    await expect(page.getByText(/\/mes/).first()).toBeVisible();
    await expect(page.getByTestId("contact-form")).toBeVisible();
  });
});

test.describe("legales y 404", () => {
  test("aviso legal con los datos del titular", async ({ page }) => {
    await page.goto("/aviso-legal");
    await expect(page.getByText("Casado Aguilera Motor SL").first()).toBeVisible();
    await expect(page.getByText("B55499149").first()).toBeVisible();
  });

  test("política de cookies permite reabrir la configuración", async ({ page }) => {
    await page.goto("/politica-cookies");
    await page.locator("main").getByRole("button", { name: "Configurar cookies" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("la 404 ofrece buscador", async ({ page }) => {
    const res = await page.goto("/no-existe-esta-pagina");
    expect(res?.status()).toBe(404);
    await page.getByRole("searchbox", { name: "Buscar vehículo" }).fill("porsche");
    await page.getByRole("searchbox", { name: "Buscar vehículo" }).press("Enter");
    await expect(page).toHaveURL(/\/vehiculos\?q=porsche/);
  });
});

test.describe("rendimiento percibido", () => {
  test("hacer scroll en la portada no descarga la escena 3D", async ({ page, isMobile }) => {
    test.skip(isMobile, "La rueda del ratón solo existe en escritorio");
    const heavy: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("car.glb")) heavy.push(r.url());
    });
    await page.goto("/");
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(2000);
    expect(heavy).toEqual([]);
    await expect(page.locator("[data-hero-mode]")).not.toHaveAttribute("data-hero-mode", "webgl");
  });

  test("al cambiar de página el listado vuelve al inicio de los resultados", async ({ page }) => {
    await page.goto("/vehiculos");
    await page.locator("[data-pagination]").scrollIntoViewIfNeeded();
    await page.locator("[data-pagination] a[aria-label='Página 2']").click();
    await expect(page).toHaveURL(/pagina=2/);
    await expect
      .poll(
        () =>
          page.evaluate(() => document.getElementById("resultados")!.getBoundingClientRect().top),
        {
          timeout: 5000,
        },
      )
      .toBeLessThan(200);
    await expect(page.locator("main article").first()).toBeInViewport();
  });
});
