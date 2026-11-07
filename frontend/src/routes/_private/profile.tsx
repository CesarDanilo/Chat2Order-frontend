import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { ErrorState } from "@/components/feedback/states";
import { ToneBadge } from "@/components/feedback/tone-badge";
import { FieldError, FieldHint } from "@/components/form/field-error";
import { PasswordInput } from "@/components/form/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useUpdateUser, useUser } from "@/hooks/queries/use-users";
import { isUnauthorizedError } from "@/lib/api";
import { getApiFieldErrors, getGenericErrorMessage } from "@/lib/api-error";
import { LIMITS, profileSchema, zodFieldErrors } from "@/lib/validation";
import type { User, UserUpdate } from "@/services/user-services";

export const Route = createFileRoute("/_private/profile")({
  component: ProfilePage,
});

// Campos mostrados junto ao input. Erros de outros campos vão para o toast.
const PROFILE_FIELDS = ["name", "email", "password", "confirmPassword"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2);
  return (letters ?? "?").toUpperCase();
}

function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const { data: user, isLoading, isError, isFetching, refetch } = useUser(authUser?.id);

  function handleLogout() {
    signOut();
    navigate({ to: "/auth" });
  }

  return (
    <>
      <Topbar
        title="Meu perfil"
        subtitle="Seus dados de acesso"
        actions={
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="size-4" aria-hidden="true" />
            Sair
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-5 md:px-6 md:py-6 *:max-w-3xl">
        {isLoading ? (
          <div className="space-y-6" aria-busy="true" aria-label="Carregando perfil">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : isError || !user ? (
          <Card className="py-0">
            <ErrorState
              title="Não foi possível carregar o perfil"
              onRetry={() => refetch()}
              retrying={isFetching}
            />
          </Card>
        ) : (
          <ProfileContent key={user.id} user={user} />
        )}
      </div>
    </>
  );
}

function ProfileContent({ user }: { user: User }) {
  const navigate = useNavigate();
  const { user: authUser, signOut, updateUser } = useAuth();
  const update = useUpdateUser();

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const result = profileSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    // Sem admin e sem confirmPassword. Senha vazia não é enviada.
    const payload: UserUpdate = { name: result.data.name, email: result.data.email };
    if (result.data.password !== "") payload.password = result.data.password;

    try {
      const updated = await update.mutateAsync({ id: user.id, data: payload });

      // Senha nova encerra todas as sessões no servidor, inclusive esta.
      if (payload.password) {
        toast.success("Senha alterada. Entre novamente.");
        signOut();
        navigate({ to: "/auth" });
        return;
      }

      if (authUser) updateUser({ ...authUser, name: updated.name, email: updated.email });
      toast.success("Perfil atualizado com sucesso.");
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      const message = getGenericErrorMessage(err, "Erro ao salvar.", PROFILE_FIELDS);
      if (message && !isUnauthorizedError(err)) toast.error(message);
    }
  }

  const describe = (field: string, hintId?: string) => {
    if (fieldErrors[field]) return { "aria-invalid": true, "aria-describedby": `${field}-error` };
    return hintId ? { "aria-describedby": hintId } : {};
  };

  return (
    <>
      <Card className="py-0">
        <CardContent className="flex items-center gap-4 p-5">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary"
          >
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <ToneBadge tone={user.admin ? "success" : "neutral"} className="hidden sm:inline-flex">
            {user.admin ? "Administrador" : "Funcionário"}
          </ToneBadge>
        </CardContent>
      </Card>

      <Card className="py-0">
        <form noValidate onSubmit={handleSave}>
          <CardContent className="space-y-6 p-5">
            <section aria-labelledby="profile-account" className="space-y-4">
              <div>
                <h3 id="profile-account" className="text-sm font-semibold">
                  Informações da conta
                </h3>
                <p className="text-sm text-muted-foreground">Nome e e-mail usados para entrar.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    maxLength={LIMITS.name.max}
                    value={form.name}
                    onChange={handleChange}
                    {...describe("name")}
                  />
                  <FieldError id="name-error" message={fieldErrors.name} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={LIMITS.email.max}
                    value={form.email}
                    onChange={handleChange}
                    {...describe("email")}
                  />
                  <FieldError id="email-error" message={fieldErrors.email} />
                </div>
              </div>
            </section>

            <section aria-labelledby="profile-password" className="space-y-4 border-t pt-6">
              <div>
                <h3 id="profile-password" className="text-sm font-semibold">
                  Alterar senha
                </h3>
                <p id="profile-password-hint" className="text-sm text-muted-foreground">
                  Deixe em branco para manter a senha atual. Ao trocar, você entra de novo.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Nova senha</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    maxLength={LIMITS.password.maxBytes}
                    value={form.password}
                    onChange={handleChange}
                    {...describe("password", "profile-password-hint")}
                  />
                  {fieldErrors.password ? (
                    <FieldError id="password-error" message={fieldErrors.password} />
                  ) : (
                    <FieldHint>Mínimo de {LIMITS.password.min} caracteres.</FieldHint>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    maxLength={LIMITS.password.maxBytes}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    {...describe("confirmPassword")}
                  />
                  <FieldError id="confirmPassword-error" message={fieldErrors.confirmPassword} />
                </div>
              </div>
            </section>
          </CardContent>
          <div className="flex justify-end border-t px-5 py-4">
            <Button type="submit" className="h-10 w-full sm:w-auto" disabled={update.isPending}>
              {update.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
