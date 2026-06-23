import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productKeys } from "@/lib/query-client";
import { ProductService, type Product } from "@/services/products-services";

const productService = new ProductService();

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: () => productService.read(),
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
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productKeys.all, context.previous);
      }
      toast.error("Não foi possível excluir o produto.");
    },
    onSuccess: () => toast.success("Produto excluído."),
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
