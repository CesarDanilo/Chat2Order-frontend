import { expect, test, type Page } from "@playwright/test";
import { AUTH_FILE, cleanupRun, uniqueName } from "./helpers";

test.use({ storageState: AUTH_FILE.user });

test.afterAll(async () => {
  await cleanupRun(["user"]);
});

async function openNewProduct(page: Page) {
  await page.goto("/products");
  await page.getByRole("button", { name: "Novo produto" }).click();
  await expect(page.getByRole("heading", { name: "Informações do produto" })).toBeVisible();
}

function productRow(page: Page, name: string) {
  return page.getByRole("row").filter({ hasText: name });
}

test("cria, edita e exclui produto", async ({ page }) => {
  const name = uniqueName("Produto");
  const renamed = uniqueName("Produto editado");

  await openNewProduct(page);
  await page.getByPlaceholder("Ex. Camiseta Básica").fill(name);
  await page.getByPlaceholder("Ex. Vestuário").fill("E2E");
  await page.getByPlaceholder("0.00").fill("12.5");
  await page.getByRole("button", { name: "Salvar Produto" }).click();

  await expect(page.getByText("Produto criado com sucesso.")).toBeVisible();
  await expect(productRow(page, name)).toBeVisible();

  await productRow(page, name).getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByPlaceholder("Ex. Camiseta Básica").fill(renamed);
  await page.getByRole("button", { name: "Salvar Alterações" }).click();

  await expect(page.getByText("Produto atualizado com sucesso.")).toBeVisible();
  await expect(productRow(page, renamed)).toBeVisible();

  await productRow(page, renamed).getByRole("button", { name: "Excluir", exact: true }).click();
  await page.getByRole("button", { name: "Excluir", exact: true }).last().click();

  await expect(page.getByText("Produto excluído.")).toBeVisible();
  await expect(productRow(page, renamed)).toHaveCount(0);
});

test("validação e limites do produto", async ({ page }) => {
  await openNewProduct(page);

  await expect(page.getByPlaceholder("Ex. Camiseta Básica")).toHaveAttribute("maxlength", "160");
  await expect(page.getByPlaceholder("Ex. Vestuário")).toHaveAttribute("maxlength", "80");
  await expect(page.getByPlaceholder("Descreva o produto...")).toHaveAttribute("maxlength", "2000");

  await page.getByRole("button", { name: "Salvar Produto" }).click();
  await expect(page.getByText("O nome do produto é obrigatório")).toBeVisible();

  await page.getByPlaceholder("0.00").fill("0");
  await page.getByRole("button", { name: "Salvar Produto" }).click();
  await expect(page.getByText("O preço deve ser maior que 0")).toBeVisible();
});
