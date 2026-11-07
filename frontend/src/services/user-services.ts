import { apiRequest } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  admin?: boolean;
  createdAt: string;
}

// POST /api/user: somente name, email e password. O admin não é enviado no cadastro.
export interface UserCreate {
  name: string;
  email: string;
  password: string;
}

// PUT /api/user/:id: password é opcional (omita se não mudou); admin só pode ser enviado por admin.
export interface UserUpdate {
  name: string;
  email: string;
  password?: string;
  admin?: boolean;
}

const BASE = "/user";

export const userService = {
  read: () => apiRequest<User[]>(BASE, { fallbackError: "Erro ao buscar usuários" }),

  readById: (id: string) =>
    apiRequest<User>(`${BASE}/${id}`, { fallbackError: "Erro ao buscar usuário" }),

  create: (data: UserCreate) =>
    apiRequest<User>(BASE, { method: "POST", body: data, fallbackError: "Erro ao criar usuário" }),

  update: (id: string, data: UserUpdate) =>
    apiRequest<User>(`${BASE}/${id}`, {
      method: "PUT",
      body: data,
      fallbackError: "Erro ao atualizar usuário",
    }),
};
