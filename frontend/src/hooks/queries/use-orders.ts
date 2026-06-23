import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderKeys } from "@/lib/query-client";
import { OrderService, type Order } from "@/services/orders-services";

const orderService = new OrderService();

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
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderKeys.all, context.previous);
      }
      toast.error("Não foi possível criar o pedido.");
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
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderKeys.all, context.previous);
      }
      toast.error("Não foi possível atualizar o pedido.");
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
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderKeys.all, context.previous);
      }
      toast.error("Não foi possível excluir o pedido.");
    },
    onSuccess: () => toast.success("Pedido excluído."),
    onSettled: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
