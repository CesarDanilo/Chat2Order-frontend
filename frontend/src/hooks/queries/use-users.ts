import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/lib/query-client";
import { isUnauthorizedError } from "@/lib/api";
import { userService, type UserCreate, type UserUpdate } from "@/services/user-services";

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      const users = await userService.read();
      return users.map((user) => ({ ...user, admin: user.admin ?? false }));
    },
  });
}

export function useUser(id: string | null | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => userService.readById(id!),
    enabled: !!id,
    // Formulários de edição partem sempre do dado mais recente.
    staleTime: 0,
  });
}

// POST sem `admin` (o backend recusa o campo na criação). Se pedido admin, um PUT em seguida.
// Falha só no PUT: o usuário já existe; o erro volta em `adminError` para a tela avisar.
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, admin }: { data: UserCreate; admin: boolean }) => {
      const created = await userService.create(data);
      let adminError: unknown = null;
      if (admin) {
        try {
          await userService.update(created.id, { name: data.name, email: data.email, admin: true });
        } catch (err) {
          // Sessão inválida segue para o tratamento central de 401.
          if (isUnauthorizedError(err)) throw err;
          adminError = err;
        }
      }
      return { created, adminError };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) => userService.update(id, data),
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
