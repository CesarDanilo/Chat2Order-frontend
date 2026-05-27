export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  admin?: boolean;
  createAt: string;
}

export class UserService {
  private baseURL = "http://127.0.0.1:3000/api/user";
  async read(): Promise<User[]> {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Usuário não autenticado");
    }

    const response = await fetch(this.baseURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || "Erro ao buscar pedidos");
    }
    const order: User[] = await response.json();
    return order;
  }
}
