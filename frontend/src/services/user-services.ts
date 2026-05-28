export interface User {
  id: string;

  name: string;

  email: string;

  password: string;

  admin?: boolean;

  createdAt: string;
}

export interface UserCreate {
  name: string;

  email: string;

  password: string;

  admin?: boolean;
}

export class UserService {
  private baseURL = `${import.meta.env.VITE_API_URL}/api/user`;

  // =========================
  // GET TOKEN
  // =========================

  private getToken() {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Usuário não autenticado");
    }

    return token;
  }

  // =========================
  // GET ALL USERS
  // =========================

  async read(): Promise<User[]> {
    const token = this.getToken();

    const response = await fetch(this.baseURL, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || "Erro ao buscar usuários");
    }

    const users: User[] = await response.json();

    return users;
  }

  // =========================
  // GET USER BY ID
  // =========================

  async readById(user_id: string): Promise<User> {
    const token = this.getToken();

    const response = await fetch(`${this.baseURL}/${user_id}`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || "Erro ao buscar usuário");
    }

    const user: User = await response.json();

    return user;
  }

  // =========================
  // CREATE USER
  // =========================

  async create(data: UserCreate): Promise<User> {
    const token = this.getToken();

    const response = await fetch(this.baseURL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || "Erro ao criar usuário");
    }

    const user: User = await response.json();

    return user;
  }

  // =========================
  // UPDATE USER
  // =========================

  async update(user_id: string, data: UserCreate): Promise<User> {
    const token = this.getToken();

    const response = await fetch(`${this.baseURL}/${user_id}`, {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || "Erro ao atualizar usuário");
    }

    const user: User = await response.json();

    return user;
  }
}
