import { expect, test, type APIRequestContext } from "@playwright/test";
import {
  API_URL,
  sessionFor,
  authHeaders,
  cleanupRun,
  createOrderApi,
  orderPayload,
  setOrderStatusApi,
  uniqueName,
  type Session,
} from "./helpers";

// Chamadas diretas à API, sem passar pelas validações do frontend.
let user: Session;
let admin: Session;

test.beforeAll(() => {
  user = sessionFor("user");
  admin = sessionFor("admin");
});

test.afterAll(async () => {
  await cleanupRun(["user", "admin"]);
});

type ErrorBody = { error: { code: string; message: string; details?: { field: string; code: string; message: string }[] } };

async function errorOf(response: Awaited<ReturnType<APIRequestContext["post"]>>): Promise<ErrorBody> {
  return (await response.json()) as ErrorBody;
}

test.describe("validação do servidor (bypass do frontend)", () => {
  test("campos inválidos devolvem 400 com detalhes por campo", async ({ request }) => {
    const response = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({ customerName: "", customerPhone: "123", items: [] }),
    });

    expect(response.status()).toBe(400);
    const body = await errorOf(response);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    const fields = (body.error.details ?? []).map((detail) => detail.field);
    expect(fields).toEqual(expect.arrayContaining(["customerName", "customerPhone", "items"]));
  });

  test("campo fora do contrato é recusado", async ({ request }) => {
    const response = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({ isAdmin: true }),
    });

    expect(response.status()).toBe(400);
    const body = await errorOf(response);
    expect(body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "isAdmin", code: "UNKNOWN_FIELD" })]),
    );
  });

  test("status fora da lista é recusado", async ({ request }) => {
    const response = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({ status: "ARQUIVADO" }),
    });

    expect(response.status()).toBe(400);
    const body = await errorOf(response);
    expect(body.error.details?.map((detail) => detail.field)).toContain("status");
  });

  test("total acima do limite é recusado", async ({ request }) => {
    const response = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({
        items: [{ productName: "Item caro", quantity: 10000, unitPrice: 1000000 }],
      }),
    });

    expect(response.status()).toBe(400);
    const body = await errorOf(response);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  test("telefone com marcador 00000000000 é aceito e gravado assim", async ({ request }) => {
    const response = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({ customerName: uniqueName("Sem telefone"), customerPhone: "00000000000" }),
    });

    expect(response.ok()).toBeTruthy();
    expect((await response.json()).customerPhone).toBe("00000000000");
  });

  test("telefone é normalizado: máscara vira dígitos e internacional mantém o +", async ({ request }) => {
    const masked = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({ customerName: uniqueName("Máscara"), customerPhone: "+55 (11) 91234-5678" }),
    });
    expect(masked.ok()).toBeTruthy();
    expect((await masked.json()).customerPhone).toBe("11912345678");

    const international = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({ customerName: uniqueName("Internacional"), customerPhone: "+14155552671" }),
    });
    expect(international.ok()).toBeTruthy();
    expect((await international.json()).customerPhone).toBe("+14155552671");
  });

  test("telefone inválido é recusado pela API", async ({ request }) => {
    const response = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({ customerPhone: "(11) 1112-3456" }),
    });

    expect(response.status()).toBe(400);
    const body = await errorOf(response);
    expect(body.error.details?.map((detail) => detail.field)).toContain("customerPhone");
  });
});

test.describe("regras de status (bypass do frontend)", () => {
  test("transição CONCLUIDO para PENDENTE responde 409 INVALID_STATE_TRANSITION", async ({ request }) => {
    const created = await createOrderApi(request, user.token, {
      customerName: uniqueName("Transição"),
      status: "CONCLUIDO",
    });

    const response = await setOrderStatusApi(request, user.token, created, "PENDENTE");

    expect(response.status()).toBe(409);
    expect((await errorOf(response)).error.code).toBe("INVALID_STATE_TRANSITION");
  });

  test("CANCELADO é final: sair dele responde 409", async ({ request }) => {
    const created = await createOrderApi(request, user.token, { customerName: uniqueName("Final") });

    const cancel = await setOrderStatusApi(request, user.token, created, "CANCELADO");
    expect(cancel.ok()).toBeTruthy();

    const response = await setOrderStatusApi(request, user.token, created, "CONCLUIDO");
    expect(response.status()).toBe(409);
    expect((await errorOf(response)).error.code).toBe("INVALID_STATE_TRANSITION");
  });

  test("manter o mesmo status é sempre permitido", async ({ request }) => {
    const created = await createOrderApi(request, user.token, {
      customerName: uniqueName("Mesmo status"),
      status: "CONCLUIDO",
    });

    const response = await setOrderStatusApi(request, user.token, created, "CONCLUIDO");
    expect(response.ok()).toBeTruthy();
  });

  // Divergência com a regra informada: o servidor responde 400 (e não 409) ao criar com CANCELADO.
  test("criar com CANCELADO é recusado (servidor responde 400)", async ({ request }) => {
    const response = await request.post(`${API_URL}/order`, {
      headers: authHeaders(user.token),
      data: orderPayload({ customerName: uniqueName("Criar cancelado"), status: "CANCELADO" }),
    });

    expect(response.status()).toBe(400);
    expect((await errorOf(response)).error.code).toBe("INVALID_STATE_TRANSITION");
  });
});

test.describe("isolamento e autenticação", () => {
  test("pedido de outra conta responde 404", async ({ request }) => {
    const adminOrder = await createOrderApi(request, admin.token, { customerName: uniqueName("Do admin") });
    const headers = authHeaders(user.token);

    const read = await request.get(`${API_URL}/order/${adminOrder.id}`, { headers });
    expect(read.status()).toBe(404);

    const update = await setOrderStatusApi(request, user.token, adminOrder, "CANCELADO");
    expect(update.status()).toBe(404);

    const remove = await request.delete(`${API_URL}/order/${adminOrder.id}`, { headers });
    expect(remove.status()).toBe(404);
  });

  test("sem token responde 401", async ({ request }) => {
    const response = await request.get(`${API_URL}/order`);

    expect(response.status()).toBe(401);
    expect((await errorOf(response)).error.code).toBe("UNAUTHORIZED");
  });

  test("token inválido responde 401", async ({ request }) => {
    const response = await request.get(`${API_URL}/order`, {
      headers: { Authorization: "Bearer token.invalido.e2e" },
    });

    expect(response.status()).toBe(401);
  });
});
