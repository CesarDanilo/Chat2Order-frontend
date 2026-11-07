import { apiRequest } from "@/lib/api";

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductPayload = Omit<Product, "id" | "createdAt" | "updatedAt">;

const BASE = "/product";

export const productService = {
  read: () => apiRequest<Product[]>(BASE, { fallbackError: "Erro ao buscar produtos" }),

  readById: (id: string) =>
    apiRequest<Product>(`${BASE}/${id}`, { fallbackError: "Erro ao buscar produtos" }),

  create: (data: ProductPayload) =>
    apiRequest<Product>(BASE, { method: "POST", body: data, fallbackError: "Erro ao criar produto" }),

  update: (id: string, data: Partial<ProductPayload>) =>
    apiRequest<Product>(`${BASE}/${id}`, {
      method: "PUT",
      body: data,
      fallbackError: "Erro ao atualizar produto",
    }),

  delete: (id: string) =>
    apiRequest<Product | undefined>(`${BASE}/${id}`, {
      method: "DELETE",
      fallbackError: "Erro ao deletar o produto",
    }),
};
