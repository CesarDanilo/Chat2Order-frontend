import { api } from "@/lib/api"

// =========================
// TYPES
// =========================

type LoginRequest = {
  email: string
  password: string
}

type LoginResponse = {
  token: string
}

type RegisterRequest = {
  name: string
  email: string
  password: string
}

type RegisterResponse = {
  id: string
  name: string
  email: string
}

// =========================
// LOGIN
// =========================

export async function loginService(
  data: LoginRequest
) {
  return api("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<LoginResponse>
}

// =========================
// REGISTER
// =========================

export async function registerService(
  data: RegisterRequest
) {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<RegisterResponse>
}