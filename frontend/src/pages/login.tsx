import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import icon from "../public/icon.png";
import { loginService, registerService } from "@/services/auth-services";
import { LIMITS, loginSchema, registerSchema, zodFieldErrors } from "@/lib/validation";
import { getApiFieldErrors, getGenericErrorMessage } from "@/lib/api-error";

type FieldErrors = Record<string, string>;

// Campos que este formulário mostra junto ao campo. O restante vai para o toast.
const LOGIN_FIELDS = ["email", "password"];
const REGISTER_FIELDS = ["name", "email", "password", "confirmPassword"];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[10px] text-destructive">{message}</p>;
}

function withoutKey(errors: FieldErrors, field: string): FieldErrors {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function clearError(field: string) {
    setFieldErrors((prev) => withoutKey(prev, field));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      setLoading(true);
      const response = await loginService(result.data);
      if (!response?.token) throw new Error("Token não encontrado");
      signIn(response.token, response.user);
      navigate({ to: "/" });
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      const message = getGenericErrorMessage(err, "Erro ao realizar login", LOGIN_FIELDS);
      if (message) toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const result = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      setLoading(true);
      // confirmPassword é só da tela: não vai para a API.
      await registerService({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });
      toast.success("Cadastro realizado com sucesso");
      setCreateAccount(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFieldErrors({});
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      const message = getGenericErrorMessage(err, "Erro ao realizar cadastro", REGISTER_FIELDS);
      if (message) toast.error(message);
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
            noValidate
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
                maxLength={LIMITS.email.max}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                aria-invalid={!!fieldErrors.email}
                className="h-9 text-sm"
                autoFocus
              />
              <FieldError message={fieldErrors.email} />
            </div>

            {createAccount && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Nome
                </Label>
                <Input
                  id="name"
                  maxLength={LIMITS.name.max}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  aria-invalid={!!fieldErrors.name}
                  className="h-9 text-sm"
                />
                <FieldError message={fieldErrors.name} />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                maxLength={createAccount ? LIMITS.password.maxBytes : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                aria-invalid={!!fieldErrors.password}
                className="h-9 text-sm"
              />
              <FieldError message={fieldErrors.password} />
            </div>

            {createAccount && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs">
                  Confirmar senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  maxLength={LIMITS.password.maxBytes}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError("confirmPassword");
                  }}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  className="h-9 text-sm"
                />
                <FieldError message={fieldErrors.confirmPassword} />
              </div>
            )}

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
                setFieldErrors({});
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
