import { apiRequest } from "@/lib/api";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
  status: "PENDENTE" | "CONCLUIDO" | "CANCELADO";
  total: number;
  source: "WHATSAPP" | "SITE";
  rawMessage: string;
  items: OrderItem[];
  createdAt?: string;
}

type CreateOrderDTO = Omit<Order, "id" | "createdAt">;

const BASE = "/order";

export const orderService = {
  read: () => apiRequest<Order[]>(BASE, { fallbackError: "Erro ao buscar pedidos" }),

  readById: (id: string) =>
    apiRequest<Order>(`${BASE}/${id}`, { fallbackError: "Erro ao buscar pedidos" }),

  create: (data: CreateOrderDTO) =>
    apiRequest<Order>(BASE, { method: "POST", body: data, fallbackError: "Erro ao criar pedido" }),

  update: (id: string, data: CreateOrderDTO) =>
    apiRequest<Order>(`${BASE}/${id}`, {
      method: "PUT",
      body: data,
      fallbackError: "Erro ao atualizar pedido",
    }),

  delete: async (id: string) => {
    await apiRequest(`${BASE}/${id}`, { method: "DELETE", fallbackError: "Erro ao deletar pedido" });
    return true;
  },
};
