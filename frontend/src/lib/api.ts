import { ApiError, readApiError } from "@/lib/api-error";
import { getStoredToken } from "@/lib/session";

// Cliente HTTP comum: monta a URL da API, envia o token e converte erros com readApiError.
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  // Rotas públicas (login, cadastro) usam auth: false. Padrão: autenticada.
  auth?: boolean;
  // Mensagem usada quando a API não envia `error.message`.
  fallbackError?: string;
}

export const SESSION_EXPIRED_MESSAGE = "Sua sessão expirou. Entre novamente.";

export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body, auth = true, fallbackError }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers();

  if (auth) {
    const token = getStoredToken();
    // Sem token não há sessão: mesmo tratamento de um 401 da API.
    if (!token) throw new ApiError(401, SESSION_EXPIRED_MESSAGE, {}, "UNAUTHENTICATED");
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw await readApiError(response, fallbackError);
  }

  // 204 ou corpo vazio: não há JSON para ler.
  const text = await response.text();
  return (text === "" ? undefined : JSON.parse(text)) as T;
}

// Sessão inválida: token ausente, expirado ou revogado.
export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
