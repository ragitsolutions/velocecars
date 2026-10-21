import { test as base, expect } from "@playwright/test";

/**
 * `test` con consentimiento de cookies ya guardado (el banner no tapa la interfaz) y con
 * `page.goto` / `page.reload` que esperan a que React haya hidratado (`html[data-hydrated]`):
 * un clic anterior a la hidratación se pierde.
 */
export const test = base.extend({
  context: async ({ context, baseURL }, provide) => {
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
        url: baseURL!,
      },
    ]);
    await provide(context);
  },
  page: async ({ page }, provide) => {
    const hydrated = () => page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    const goto = page.goto.bind(page);
    const reload = page.reload.bind(page);
    page.goto = async (...args) => {
      const res = await goto(...args);
      await hydrated();
      return res;
    };
    page.reload = async (...args) => {
      const res = await reload(...args);
      await hydrated();
      return res;
    };
    await provide(page);
  },
});

export { expect };
