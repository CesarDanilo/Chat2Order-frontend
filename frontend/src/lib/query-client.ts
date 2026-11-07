import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { isUnauthorizedError } from "@/lib/api";
import { expireSession } from "@/lib/session";

// Tratamento central de sessão inválida: qualquer 401 vindo de uma query ou mutation
// limpa a sessão; o AuthProvider e o roteador reagem (estado limpo e ida para /auth).
function handleError(error: unknown) {
  if (isUnauthorizedError(error)) expireSession();
}

// Erros do cliente (4xx) não melhoram com nova tentativa.
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
});

export const orderKeys = {
  all: ["orders"] as const,
  detail: (id: string) => ["orders", id] as const,
};

export const productKeys = {
  all: ["products"] as const,
  detail: (id: string) => ["products", id] as const,
};

export const userKeys = {
  all: ["users"] as const,
  detail: (id: string) => ["users", id] as const,
};
