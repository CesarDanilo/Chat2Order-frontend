import { useState } from "react";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import icon from "../public/icon.png";
import { loginService, registerService } from "@/services/auth-services";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

const registerSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[10px] text-destructive">{message}</p>;
}

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldError(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      const response = await loginService({ email, password });
      if (!response?.token) throw new Error("Token não encontrado");
      signIn(response.token, response.user);
      navigate({ to: "/" });
    } catch {
      toast.error("Erro ao realizar login");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    const result = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!result.success) {
      setFieldError(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      await registerService({ name, email, password });
      toast.success("Cadastro realizado com sucesso");
      setCreateAccount(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm rounded-lg shadow-sm">
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-2">
              <img src={icon} alt="" className="size-6" />
              <h1 className="text-lg font-bold">Bem-vindo</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {createAccount
                ? "Crie sua conta para continuar"
                : "Entre com sua conta para continuar"}
            </p>
          </div>

          <form
            onSubmit={createAccount ? handleRegister : handleLogin}
            className="flex flex-col gap-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm"
                autoFocus
              />
            </div>

            {createAccount && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {createAccount && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs">
                  Confirmar senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            )}

            <FieldError message={fieldError ?? undefined} />

            <Button type="submit" disabled={loading} className="h-9 w-full text-sm">
              {loading
                ? createAccount
                  ? "Cadastrando..."
                  : "Entrando..."
                : createAccount
                  ? "Criar conta"
                  : "Entrar"}
            </Button>

            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setCreateAccount(!createAccount);
                setFieldError(null);
              }}
            >
              {createAccount ? "Já tenho uma conta" : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-[10px] text-muted-foreground">
            Chat2Order · Plataforma operacional
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
