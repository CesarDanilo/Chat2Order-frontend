import { apiRequest } from "@/lib/api";
import type { SessionUser } from "@/lib/session";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: SessionUser;
};

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  id: string;
  name: string;
  email: string;
};

// Rotas públicas: sem token e fora do tratamento de 401 (senha errada não é sessão expirada).
export function loginService(data: LoginRequest) {
  return apiRequest<LoginResponse>("/auth/login", { method: "POST", body: data, auth: false });
}

export function registerService(data: RegisterRequest) {
  return apiRequest<RegisterResponse>("/user", { method: "POST", body: data, auth: false });
}

// Encerra a sessão no servidor (usa o token guardado no momento da chamada).
// Sem rede, o token só expira no prazo normal.
export function logoutService() {
  return apiRequest("/auth/logout", { method: "POST" });
}
