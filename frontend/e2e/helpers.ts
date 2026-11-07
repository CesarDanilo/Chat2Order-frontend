import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { request as playwrightRequest, type APIRequestContext } from "@playwright/test";

export const BASE_URL = "http://localhost:5173";
export const API_URL = "http://localhost:3001/api";

export type Role = "admin" | "user";

// Sessões salvas pelo auth.setup.ts (arquivos ignorados pelo git).
export const AUTH_FILE: Record<Role, string> = {
  admin: fileURLToPath(new URL("./.auth/admin.json", import.meta.url)),
  user: fileURLToPath(new URL("./.auth/user.json", import.meta.url)),
};

export const EMPTY_STATE = { cookies: [], origins: [] };

// Identificador da execução: todo dado criado pelos testes leva este texto e é removido ao final.
export const RUN_ID = `e2e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function uniqueName(label: string): string {
  return `${RUN_ID} ${label}`;
}

export function credentials(role: Role): { email: string; password: string } {
  const prefix = role === "admin" ? "E2E_ADMIN" : "E2E_USER";
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) {
    throw new Error(`Defina ${prefix}_EMAIL e ${prefix}_PASSWORD (ambiente ou .env.e2e).`);
  }
  return { email, password };
}

export interface Session {
  token: string;
  user: { id: string; name: string; email: string; admin: boolean };
}

// Sessão já salva pelo setup no storageState (sem nova requisição de login).
export function sessionFor(role: Role): Session {
  const state = JSON.parse(readFileSync(AUTH_FILE[role], "utf8")) as {
    origins?: { origin: string; localStorage?: { name: string; value: string }[] }[];
  };
  const entries = state.origins?.find((origin) => origin.origin === BASE_URL)?.localStorage ?? [];
  const values = Object.fromEntries(entries.map((entry) => [entry.name, entry.value]));
  if (!values.token || !values.user) throw new Error(`Sessão (${role}) ausente: rode o setup do Playwright.`);
  return { token: values.token, user: JSON.parse(values.user) };
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Corpo válido de POST/PUT /api/order. Sobrescreva só o que o teste precisa.
export function orderPayload(overrides: Record<string, unknown> = {}) {
  return {
    customerName: uniqueName("Cliente"),
    customerPhone: "11912345678",
    address: "Rua E2E, 100",
    paymentMethod: "PIX",
    status: "PENDENTE",
    source: "SITE",
    rawMessage: "",
    items: [{ productName: "Item E2E", quantity: 1, unitPrice: 10 }],
    ...overrides,
  };
}

export interface CreatedOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
}

// Cria pedido direto na API (preparação dos testes). Retorna o pedido criado.
export async function createOrderApi(
  request: APIRequestContext,
  token: string,
  overrides: Record<string, unknown> = {},
): Promise<CreatedOrder> {
  const response = await request.post(`${API_URL}/order`, {
    headers: authHeaders(token),
    data: orderPayload(overrides),
  });
  if (!response.ok()) throw new Error(`Criação de pedido de teste falhou: ${response.status()}`);
  return (await response.json()) as CreatedOrder;
}

// Remove pedidos, produtos e usuários criados pela execução (identificados pelo RUN_ID).
export async function cleanupRun(roles: Role[]) {
  const request = await playwrightRequest.newContext();
  try {
    for (const role of roles) {
      const session = sessionFor(role);
      const headers = authHeaders(session.token);

      const orders = await (await request.get(`${API_URL}/order`, { headers })).json();
      for (const order of orders as { id: string; customerName: string }[]) {
        if (order.customerName.includes(RUN_ID)) {
          await request.delete(`${API_URL}/order/${order.id}`, { headers });
        }
      }

      const products = await (await request.get(`${API_URL}/product`, { headers })).json();
      for (const product of products as { id: string; name: string }[]) {
        if (product.name.includes(RUN_ID)) {
          await request.delete(`${API_URL}/product/${product.id}`, { headers });
        }
      }

      if (role === "admin") {
        const users = await (await request.get(`${API_URL}/user`, { headers })).json();
        for (const user of users as { id: string; email: string }[]) {
          if (user.email.includes(RUN_ID)) {
            await request.delete(`${API_URL}/user/${user.id}`, { headers });
          }
        }
      }
    }
  } finally {
    await request.dispose();
  }
}

// Muda o status de um pedido pela API (PUT exige o corpo completo).
export async function setOrderStatusApi(
  request: APIRequestContext,
  token: string,
  order: { id: string; customerName: string },
  status: "PENDENTE" | "CONCLUIDO" | "CANCELADO",
) {
  return request.put(`${API_URL}/order/${order.id}`, {
    headers: authHeaders(token),
    data: orderPayload({ customerName: order.customerName, status }),
  });
}
