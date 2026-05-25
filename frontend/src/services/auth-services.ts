import { api } from "@/lib/api"

// =========================
// TYPES
// =========================

type User = {
  id: string
  name: string
  email: string
  admin: boolean
}

type LoginRequest = {
  email: string
  password: string
}

type LoginResponse = {
  token: string
  user: User
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
  return api("/user/", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<RegisterResponse>
}