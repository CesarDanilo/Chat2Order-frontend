import { expect, test } from "@playwright/test";
import { AUTH_FILE, EMPTY_STATE, RUN_ID, cleanupRun, credentials, uniqueName } from "./helpers";

test.describe("login e sessão", () => {
  test.use({ storageState: EMPTY_STATE });

  test("login válido entra e grava a sessão", async ({ page }) => {
    const { email, password } = credentials("admin");

    await page.goto("/auth");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/orders(\?|$)/);
    expect(await page.evaluate(() => localStorage.getItem("token"))).toBeTruthy();
  });

  // Única tentativa errada da suíte inteira (o limite do servidor é 10 por 15 min).
  test("login inválido mostra o erro e não entra", async ({ page }) => {
    const { email } = credentials("admin");

    await page.goto("/auth");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("senha-errada-e2e-2026");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
    await expect(page).toHaveURL(/\/auth$/);
    expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
  });

  test("login sem preencher mostra erros de campo sem chamar a API", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Informe o e-mail")).toBeVisible();
    await expect(page.getByText("Informe a senha")).toBeVisible();
  });

  test("rota protegida sem sessão redireciona para /auth", async ({ page }) => {
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/auth$/);
  });
});

test.describe("sessão do usuário comum", () => {
  test.use({ storageState: AUTH_FILE.user });

  test("logout encerra a sessão e bloqueia as rotas privadas", async ({ page }) => {
    await page.goto("/profile");
    await page.getByRole("button", { name: "Sair" }).click();

    await expect(page).toHaveURL(/\/auth$/);
    expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();

    await page.goto("/orders");
    await expect(page).toHaveURL(/\/auth$/);
  });

  test("não-admin é redirecionado de /users", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe("admin", () => {
  test.use({ storageState: AUTH_FILE.admin });

  test("admin acessa /users", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/users$/);
    await expect(page.getByText("Usuários cadastrados")).toBeVisible();
  });
});

test.describe("cadastro", () => {
  test.use({ storageState: EMPTY_STATE });

  test.afterAll(async () => {
    await cleanupRun(["admin"]);
  });

  async function openRegister(page: import("@playwright/test").Page) {
    await page.goto("/auth");
    await page.locator('button[type="button"]', { hasText: "Criar conta" }).click();
  }

  test("cadastro com erros de campo não envia o formulário", async ({ page }) => {
    await openRegister(page);

    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText("Informe o e-mail")).toBeVisible();
    await expect(page.getByText("Informe a senha")).toBeVisible();

    await page.locator("#email").fill("nao-e-email");
    await page.locator("#name").fill("ab");
    await page.locator("#password").fill("123");
    await page.locator("#confirmPassword").fill("outra-senha-2026");
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText("E-mail inválido")).toBeVisible();
    await expect(page.getByText("O nome deve ter no mínimo 3 caracteres")).toBeVisible();
    await expect(page.getByText("A senha deve ter no mínimo 8 caracteres")).toBeVisible();
    await expect(page.getByText("As senhas não coincidem")).toBeVisible();
  });

  test("senha comum é recusada no cadastro", async ({ page }) => {
    await openRegister(page);

    await page.locator("#email").fill(`${RUN_ID}-comum@example.com`);
    await page.locator("#name").fill(uniqueName("Senha comum"));
    await page.locator("#password").fill("password");
    await page.locator("#confirmPassword").fill("password");
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText("Escolha uma senha menos comum")).toBeVisible();
  });

  test("e-mail já cadastrado mostra o erro no campo de e-mail", async ({ page }) => {
    await openRegister(page);

    await page.locator("#email").fill(credentials("user").email);
    await page.locator("#name").fill(uniqueName("Duplicado"));
    await page.locator("#password").fill("Senha-e2e-2026");
    await page.locator("#confirmPassword").fill("Senha-e2e-2026");
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText("Já existe um cadastro com este e-mail.")).toBeVisible();
  });

  // Único cadastro bem-sucedido da suíte (o limite do servidor é 10 por hora por rede).
  test("cadastro válido cria a conta", async ({ page }) => {
    await openRegister(page);

    await page.locator("#email").fill(`${RUN_ID}@example.com`);
    await page.locator("#name").fill(uniqueName("Cadastro"));
    await page.locator("#password").fill("Senha-e2e-2026");
    await page.locator("#confirmPassword").fill("Senha-e2e-2026");
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText("Cadastro realizado com sucesso")).toBeVisible();
  });
});
