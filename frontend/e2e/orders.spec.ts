import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  API_URL,
  AUTH_FILE,
  sessionFor,
  authHeaders,
  cleanupRun,
  createOrderApi,
  setOrderStatusApi,
  uniqueName,
} from "./helpers";

test.use({ storageState: AUTH_FILE.user });

test.afterAll(async () => {
  await cleanupRun(["user", "admin"]);
});

// Drawer de pedido (role dialog). Origem, Pagamento e Status são o 1º, 2º e 3º combobox.
function drawer(page: Page) {
  return page.getByRole("dialog");
}

function statusTrigger(page: Page) {
  return drawer(page).getByRole("combobox").nth(2);
}

function orderRow(page: Page, customerName: string) {
  return page.getByRole("row").filter({ hasText: customerName });
}

function option(page: Page, label: string): Locator {
  return page.getByRole("option", { name: label, exact: true });
}

async function openOrderEdit(page: Page, customerName: string) {
  await page.goto("/orders");
  await orderRow(page, customerName).getByRole("button", { name: "Editar", exact: true }).click();
  await expect(drawer(page).getByRole("button", { name: "Salvar alterações" })).toBeVisible();
}

async function openNewOrder(page: Page) {
  await page.goto("/orders");
  await page.getByRole("button", { name: "Novo pedido" }).first().click();
  await expect(drawer(page).getByRole("button", { name: "Salvar pedido" })).toBeVisible();
}

async function fillFirstItem(page: Page, productName: string, quantity: string, unitPrice: string) {
  const item = drawer(page).getByPlaceholder("Produto").first();
  await item.fill(productName);
  const row = item.locator("xpath=ancestor::div[contains(@class,'grid-cols-12')][1]");
  await row.getByRole("spinbutton").nth(0).fill(quantity);
  await row.getByRole("spinbutton").nth(1).fill(unitPrice);
}

test("cria pedido pela tela e grava o telefone normalizado", async ({ page, request }) => {
  const customerName = uniqueName("Pedido tela");

  await openNewOrder(page);
  await page.locator("#customerName").fill(customerName);
  await page.locator("#customerPhone").fill("(11) 91234-5678");
  await page.locator("#address").fill("Rua E2E, 100");
  await fillFirstItem(page, "Item tela", "2", "15.5");
  await drawer(page).getByRole("button", { name: "Salvar pedido" }).click();

  await expect(page.getByText("Pedido criado com sucesso.")).toBeVisible();
  await expect(orderRow(page, customerName)).toBeVisible();

  const session = sessionFor("user");
  const orders = await (await request.get(`${API_URL}/order`, { headers: authHeaders(session.token) })).json();
  const saved = (orders as { customerName: string; customerPhone: string }[]).find(
    (order) => order.customerName === customerName,
  );
  expect(saved?.customerPhone).toBe("11912345678");
});

test("edita pedido: telefone formatado no campo e troca de status", async ({ page, request }) => {
  const session = sessionFor("user");
  const customerName = uniqueName("Pedido edição");
  const created = await createOrderApi(request, session.token, { customerName });

  await openOrderEdit(page, customerName);
  await expect(page.locator("#customerPhone")).toHaveValue("(11) 91234-5678");

  await statusTrigger(page).click();
  await option(page, "Concluído").click();
  await drawer(page).getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Pedido atualizado com sucesso.")).toBeVisible();

  const response = await request.get(`${API_URL}/order/${created.id}`, { headers: authHeaders(session.token) });
  expect((await response.json()).status).toBe("CONCLUIDO");
});

test("pedido CONCLUIDO não oferece PENDENTE na tela", async ({ page, request }) => {
  const session = sessionFor("user");
  const customerName = uniqueName("Pedido concluído");
  await createOrderApi(request, session.token, { customerName, status: "CONCLUIDO" });

  await openOrderEdit(page, customerName);
  await statusTrigger(page).click();

  await expect(option(page, "Pendente")).toHaveAttribute("aria-disabled", "true");
  await expect(option(page, "Concluído")).not.toHaveAttribute("aria-disabled", "true");
  await expect(option(page, "Cancelado")).not.toHaveAttribute("aria-disabled", "true");
});

test("pedido CANCELADO só mantém o próprio status na tela", async ({ page, request }) => {
  const session = sessionFor("user");
  const customerName = uniqueName("Pedido cancelado");
  const created = await createOrderApi(request, session.token, { customerName });
  const cancel = await setOrderStatusApi(request, session.token, created, "CANCELADO");
  expect(cancel.ok()).toBeTruthy();

  await openOrderEdit(page, customerName);
  await statusTrigger(page).click();

  await expect(option(page, "Pendente")).toHaveAttribute("aria-disabled", "true");
  await expect(option(page, "Concluído")).toHaveAttribute("aria-disabled", "true");
  await expect(option(page, "Cancelado")).not.toHaveAttribute("aria-disabled", "true");
});

test("criação não oferece CANCELADO", async ({ page }) => {
  await openNewOrder(page);
  await statusTrigger(page).click();

  await expect(option(page, "Pendente")).toBeVisible();
  await expect(option(page, "Concluído")).toBeVisible();
  await expect(option(page, "Cancelado")).toHaveCount(0);
});

test("409 de transição aparece como toast com a mensagem do servidor", async ({ page, request }) => {
  const session = sessionFor("user");
  const customerName = uniqueName("Pedido conflito");
  const created = await createOrderApi(request, session.token, { customerName });

  await openOrderEdit(page, customerName);

  // Outra operação cancela o pedido enquanto a tela ainda mostra PENDENTE.
  const cancel = await setOrderStatusApi(request, session.token, created, "CANCELADO");
  expect(cancel.ok()).toBeTruthy();

  await statusTrigger(page).click();
  await option(page, "Concluído").click();
  await drawer(page).getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Este pedido não pode mudar para o status escolhido.")).toBeVisible();
});

test("exclui pedido pela lista", async ({ page, request }) => {
  const session = sessionFor("user");
  const customerName = uniqueName("Pedido excluir");
  await createOrderApi(request, session.token, { customerName });

  await page.goto("/orders");
  await orderRow(page, customerName).getByRole("button", { name: "Excluir", exact: true }).click();
  await page.getByRole("button", { name: "Excluir", exact: true }).last().click();

  await expect(page.getByText("Pedido excluído.")).toBeVisible();
  await expect(orderRow(page, customerName)).toHaveCount(0);
});

test("limites de caracteres e mensagens de validação do pedido", async ({ page }) => {
  await openNewOrder(page);

  await expect(page.locator("#customerName")).toHaveAttribute("maxlength", "120");
  await expect(page.locator("#customerPhone")).toHaveAttribute("maxlength", "25");
  await expect(page.locator("#address")).toHaveAttribute("maxlength", "500");
  await expect(page.locator("#rawMessage")).toHaveAttribute("maxlength", "50000");
  await expect(drawer(page).getByPlaceholder("Produto").first()).toHaveAttribute("maxlength", "200");

  await drawer(page).getByRole("button", { name: "Salvar pedido" }).click();
  await expect(page.getByText("O nome do cliente é obrigatório")).toBeVisible();
  await expect(page.getByText("Informe o telefone")).toBeVisible();
  await expect(page.getByText("O endereço é obrigatório")).toBeVisible();
});

test("telefone inválido é recusado na tela", async ({ page }) => {
  await openNewOrder(page);

  await page.locator("#customerPhone").fill("1234");
  await drawer(page).getByRole("button", { name: "Salvar pedido" }).click();
  await expect(page.getByText("Telefone inválido")).toBeVisible();

  // DDD 11 com 10 dígitos e 3º dígito 1: fixo inválido.
  await page.locator("#customerPhone").fill("(11) 1112-3456");
  await drawer(page).getByRole("button", { name: "Salvar pedido" }).click();
  await expect(page.getByText("Telefone inválido")).toBeVisible();
});

test("total acima de R$ 1.000.000.000 mostra a mensagem em português", async ({ page }) => {
  await openNewOrder(page);

  await page.locator("#customerName").fill(uniqueName("Pedido total"));
  await page.locator("#customerPhone").fill("11912345678");
  await page.locator("#address").fill("Rua E2E, 100");
  await fillFirstItem(page, "Item caro", "10000", "1000000");
  await drawer(page).getByRole("button", { name: "Salvar pedido" }).click();

  await expect(page.getByText("O total do pedido não pode passar de R$ 1.000.000.000,00")).toBeVisible();
});

test("lista mostra só os pedidos da própria conta", async ({ page, request }) => {
  const admin = sessionFor("admin");
  const customerName = uniqueName("Pedido do admin");
  await createOrderApi(request, admin.token, { customerName });

  await page.goto("/orders");
  await expect(page.getByRole("button", { name: "Novo pedido" }).first()).toBeVisible();
  await expect(orderRow(page, customerName)).toHaveCount(0);
});
