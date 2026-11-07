import { expect, test as setup } from "@playwright/test";
import { AUTH_FILE, BASE_URL, type Role, credentials } from "./helpers";

// Um login de UI por conta; as sessões são reaproveitadas pelos demais specs (storageState).
async function loginAndSave(browser: import("@playwright/test").Browser, role: Role) {
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();
  const { email, password } = credentials(role);

  await page.goto("/auth");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/orders(\?|$)/);
  await context.storageState({ path: AUTH_FILE[role] });
  await context.close();
}

setup("autentica admin e usuário comum", async ({ browser }) => {
  await loginAndSave(browser, "admin");
  await loginAndSave(browser, "user");
});
