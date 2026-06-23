import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
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
