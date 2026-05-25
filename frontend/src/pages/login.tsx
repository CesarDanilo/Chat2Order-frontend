// src/pages/Login.tsx

import { useState } from "react";
import { z } from "zod";

import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/context/auth-context";


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import icon from "../public/icon.png";
import { loginService, registerService } from "@/services/auth-services";

export function Login() {

  // =========================
  // NAVIGATION / AUTH
  // =========================

  const navigate = useNavigate();

  const { signIn } = useAuth();

  // =========================
  // STATES
  // =========================

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  // =========================
  // SCHEMAS
  // =========================

  const loginSchema = z.object({
    email: z.string().email("Email inválido"),

    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres"),
  });

  const registerSchema = z
    .object({
      name: z
        .string()
        .min(3, "O nome deve ter no mínimo 3 caracteres"),

      email: z.string().email("Email inválido"),

      password: z
        .string()
        .min(8, "A senha deve ter no mínimo 8 caracteres"),

      confirmPassword: z.string().min(8),
    })

    .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    });

  // =========================
  // LOGIN
  // =========================

  async function handleLogin(e: React.FormEvent) {

    e.preventDefault();

    try {

      setLoading(true);

      const result = loginSchema.safeParse({
        email,
        password,
      });

      if (!result.success) {

        alert(result.error.issues[0].message);

        return;
      }

      const response = await loginService({
        email,
        password,
      });

      if (!response?.token) {
        throw new Error("Token não encontrado");
      }

      signIn(response.token);

      navigate({
        to: "/",
      });

    } catch (error) {

      console.error(error);

      alert("Erro ao realizar login");

    } finally {

      setLoading(false);

    }
  }

  // =========================
  // REGISTER
  // =========================

  async function handleRegister(e: React.FormEvent) {

    e.preventDefault();

    try {

      setLoading(true);

      const result = registerSchema.safeParse({
        name,
        email,
        password,
        confirmPassword,
      });

      if (!result.success) {

        alert(result.error.issues[0].message);

        return;
      }

      const response = await registerService({
        name,
        email,
        password,
      });

      if (!response) {
        throw new Error("Erro ao realizar cadastro");
      }

      alert("Cadastro realizado com sucesso");

      setCreateAccount(false);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {

      console.error(error);

      alert("Erro ao realizar cadastro");

    } finally {

      setLoading(false);

    }
  }

  return (

    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-100 p-4">

      <Card className="w-full max-w-sm rounded-2xl border-zinc-200 shadow-lg">

        <CardContent className="flex flex-col justify-center gap-6 p-6">

          {/* HEADER */}
          <div className="flex flex-col items-center justify-center gap-1 text-center">

            <div className="flex items-center justify-center gap-2">

              <div className="w-6">
                <img src={icon} alt="logo" />
              </div>

              <h1 className="text-2xl font-bold text-zinc-900">
                Bem-vindo
              </h1>

            </div>

            <p className="text-sm text-zinc-500">

              {createAccount
                ? "Crie sua conta para continuar"
                : "Entre com sua conta para continuar"}

            </p>

          </div>

          {/* FORM */}
          <form
            onSubmit={
              createAccount
                ? handleRegister
                : handleLogin
            }
            className="flex flex-col gap-4"
          >

            {/* EMAIL */}
            <div className="flex flex-col gap-2">

              <label className="text-sm font-medium text-zinc-700">
                Email
              </label>

              <Input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            {/* NAME */}
            {createAccount && (

              <div className="flex flex-col gap-2">

                <label className="text-sm font-medium text-zinc-700">
                  Nome
                </label>

                <Input
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

              </div>

            )}

            {/* PASSWORD */}
            <div className="flex flex-col gap-2">

              <label className="text-sm font-medium text-zinc-700">
                Senha
              </label>

              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>

            {/* CONFIRM PASSWORD */}
            {createAccount && (

              <div className="flex flex-col gap-2">

                <label className="text-sm font-medium text-zinc-700">
                  Confirmar senha
                </label>

                <Input
                  type="password"
                  placeholder="Digite novamente sua senha"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

              </div>

            )}

            {/* BUTTONS */}
            <div className="flex flex-col gap-2">

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >

                {loading
                  ? createAccount
                    ? "Cadastrando..."
                    : "Entrando..."
                  : createAccount
                    ? "Criar conta"
                    : "Entrar"}

              </Button>

              <span
                className="mt-2 flex cursor-pointer items-center justify-center text-sm text-zinc-600 hover:text-zinc-900"
                onClick={() =>
                  setCreateAccount(!createAccount)
                }
              >

                {createAccount
                  ? "Já tenho uma conta"
                  : "Criar conta"}

              </span>

            </div>

          </form>

          {/* FOOTER */}
          <p className="text-center text-xs text-zinc-400">
            Chat2Order • Plataforma segura
          </p>

        </CardContent>

      </Card>

    </div>
  );
}