import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderKeys } from "@/lib/query-client";
import { getErrorMessage, getGenericErrorMessage } from "@/lib/api-error";
import { OrderService, type Order } from "@/services/orders-services";

const orderService = new OrderService();

// Campos de pedido que o OrderDrawer mostra junto ao input (itens, cliente, observação, total).
// Os demais erros de validação vão para o toast.
const ORDER_SHOWN_FIELD =
  /^(customerName|customerPhone|address|rawMessage|total|items|items\.\d+\.(productName|quantity|unitPrice))$/;
const isOrderFieldShown = (field: string) => ORDER_SHOWN_FIELD.test(field);

type OrderPayload = Omit<Order, "id" | "createdAt"> & {
  rawMessage?: string;
};

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: () => orderService.read(),
  });
}

export function useOrder(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => orderService.readById(id!),
    enabled: enabled && !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderPayload) => orderService.create(data),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.all });
      const previous = queryClient.getQueryData<Order[]>(orderKeys.all) ?? [];
      const optimistic: Order = {
        ...newOrder,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Order[]>(orderKeys.all, [optimistic, ...previous]);
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderKeys.all, context.previous);
      }
      const message = getGenericErrorMessage(err, "Não foi possível criar o pedido.", isOrderFieldShown);
      if (message) toast.error(message);
    },
    onSuccess: () => toast.success("Pedido criado com sucesso."),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrderPayload }) =>
      orderService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.all });
      const previous = queryClient.getQueryData<Order[]>(orderKeys.all) ?? [];
      queryClient.setQueryData<Order[]>(
        orderKeys.all,
        previous.map((o) => (o.id === id ? { ...o, ...data } : o)),
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderKeys.all, context.previous);
      }
      const message = getGenericErrorMessage(err, "Não foi possível atualizar o pedido.", isOrderFieldShown);
      if (message) toast.error(message);
    },
    onSuccess: () => toast.success("Pedido atualizado com sucesso."),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.all });
      const previous = queryClient.getQueryData<Order[]>(orderKeys.all) ?? [];
      queryClient.setQueryData<Order[]>(
        orderKeys.all,
        previous.filter((o) => o.id !== id),
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderKeys.all, context.previous);
      }
      toast.error(getErrorMessage(err, "Não foi possível excluir o pedido."));
    },
    onSuccess: () => toast.success("Pedido excluído."),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
