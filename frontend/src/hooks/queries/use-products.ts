import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productKeys } from "@/lib/query-client";
import { isUnauthorizedError } from "@/lib/api";
import { getErrorMessage } from "@/lib/api-error";
import { productService, type Product, type ProductPayload } from "@/services/products-services";

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: () => productService.read(),
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => productService.readById(id!),
    enabled: !!id,
    // O formulário de edição sempre parte do dado mais recente.
    staleTime: 0,
  });
}

// Cria (sem id) ou atualiza (com id) um produto.
export function useSaveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: ProductPayload }) =>
      id ? productService.update(id, data) : productService.create(data),
    onSuccess: (_product, { id }) =>
      toast.success(id ? "Produto atualizado com sucesso." : "Produto criado com sucesso."),
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });
      const previous = queryClient.getQueryData<Product[]>(productKeys.all) ?? [];
      queryClient.setQueryData<Product[]>(
        productKeys.all,
        previous.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productKeys.all, context.previous);
      }
      if (!isUnauthorizedError(err)) {
        toast.error(getErrorMessage(err, "Não foi possível excluir o produto."));
      }
    },
    onSuccess: () => toast.success("Produto excluído."),
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
