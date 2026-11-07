import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { FieldError } from "@/components/form/field-error";
import { PasswordInput } from "@/components/form/password-input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

function withoutKey(errors: FieldErrors, field: string): FieldErrors {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  // ?expired=true: chegou aqui porque a API recusou a sessão (401).
  const { expired } = useSearch({ strict: false }) as { expired?: boolean };

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

  // Liga o campo à mensagem de erro (lida pelo leitor de tela junto com o rótulo).
  const describe = (field: string) =>
    fieldErrors[field] ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {};

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

    const result = registerSchema.safeParse({ name, email, password, confirmPassword });
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
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={icon} alt="" width={40} height={40} className="size-10" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            {createAccount ? "Criar sua conta" : "Entrar no Chat2Order"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {createAccount
              ? "Preencha os dados para começar."
              : "Monte e acompanhe os pedidos do WhatsApp."}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {expired && !createAccount ? (
            <Alert className="mb-5 border-warning-border bg-warning-bg text-warning-fg" role="status">
              <Clock aria-hidden="true" />
              <AlertDescription className="text-warning-fg">
                Sua sessão expirou. Entre novamente.
              </AlertDescription>
            </Alert>
          ) : null}

          <form
            noValidate
            onSubmit={createAccount ? handleRegister : handleLogin}
            className="flex flex-col gap-4"
          >
            {createAccount && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  maxLength={LIMITS.name.max}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  className="h-10"
                  {...describe("name")}
                />
                <FieldError id="name-error" message={fieldErrors.name} />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                maxLength={LIMITS.email.max}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                className="h-10"
                autoFocus
                {...describe("email")}
              />
              <FieldError id="email-error" message={fieldErrors.email} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                autoComplete={createAccount ? "new-password" : "current-password"}
                maxLength={createAccount ? LIMITS.password.maxBytes : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                className="h-10"
                {...describe("password")}
              />
              <FieldError id="password-error" message={fieldErrors.password} />
            </div>

            {createAccount && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  maxLength={LIMITS.password.maxBytes}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError("confirmPassword");
                  }}
                  className="h-10"
                  {...describe("confirmPassword")}
                />
                <FieldError id="confirmPassword-error" message={fieldErrors.confirmPassword} />
              </div>
            )}

            <Button type="submit" disabled={loading} className="mt-1 h-10 w-full">
              {loading
                ? createAccount
                  ? "Cadastrando..."
                  : "Entrando..."
                : createAccount
                  ? "Criar conta"
                  : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {createAccount ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
          <button
            type="button"
            className="rounded-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setCreateAccount(!createAccount);
              setFieldErrors({});
            }}
          >
            {createAccount ? "Fazer login" : "Criar conta"}
          </button>
        </p>
      </main>
    </div>
  );
}
