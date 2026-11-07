import { useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/feedback/states";
import { FieldError, FieldHint } from "@/components/form/field-error";
import { PasswordInput } from "@/components/form/password-input";
import { DrawerPanelHeader } from "@/components/layout/DrawerPanelHeader";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateUser, useUpdateUser, useUser } from "@/hooks/queries/use-users";
import { isUnauthorizedError } from "@/lib/api";
import { getApiFieldErrors, getErrorMessage, getGenericErrorMessage } from "@/lib/api-error";
import { focusDrawerField } from "@/lib/focus";
import { LIMITS, userCreateSchema, userUpdateSchema, zodFieldErrors } from "@/lib/validation";
import type { User, UserUpdate } from "@/services/user-services";

type FieldErrors = Record<string, string>;

// Campos mostrados junto ao input. Erros de outros campos vão para o toast.
const USER_FIELDS = ["name", "email", "password"];

interface DrawerUsersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  userId: string | null;
}

const errorId = (field: string) => `user-${field}-error`;

function withoutKey(errors: FieldErrors, field: string): FieldErrors {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

// O conteúdo é desmontado ao fechar: cada abertura começa com o formulário limpo.
export function DrawerUsers({ open, onOpenChange, mode, userId }: DrawerUsersProps) {
  const close = () => onOpenChange(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-dvh" onOpenAutoFocus={focusDrawerField}>
        <DrawerPanelHeader
          title={mode === "create" ? "Novo usuário" : "Editar usuário"}
          description={
            mode === "create"
              ? "Cadastre um novo usuário na plataforma."
              : "Atualize as informações do usuário."
          }
        />
        {mode === "create" ? (
          <UserForm userId={null} onDone={close} />
        ) : userId ? (
          <EditUser userId={userId} onDone={close} />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function EditUser({ userId, onDone }: { userId: string; onDone: () => void }) {
  const { data, isError, isFetchedAfterMount, isFetching, refetch } = useUser(userId);

  if (isError && !data) {
    return (
      <ErrorState
        title="Não foi possível buscar o usuário"
        onRetry={() => refetch()}
        retrying={isFetching}
        className="flex-1"
      />
    );
  }

  if (!data || !isFetchedAfterMount) {
    return (
      <div className="flex-1 space-y-5 p-5" aria-busy="true" aria-label="Carregando usuário">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return <UserForm key={userId} userId={userId} initial={data} onDone={onDone} />;
}

function UserForm({
  userId,
  initial,
  onDone,
}: {
  userId: string | null;
  initial?: User;
  onDone: () => void;
}) {
  const isCreate = userId === null;
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  // Na edição a senha é opcional: começa vazia e só é enviada se preenchida.
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(initial?.admin ?? false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const saving = createUser.isPending || updateUser.isPending;

  function clearFieldError(field: string) {
    setFieldErrors((prev) => withoutKey(prev, field));
  }

  function showApiError(err: unknown, fallback: string) {
    setFieldErrors(getApiFieldErrors(err));
    const message = getGenericErrorMessage(err, fallback, USER_FIELDS);
    if (message && !isUnauthorizedError(err)) toast.error(message);
  }

  async function handleCreate() {
    // Validação no cliente só para UX; o backend valida de novo.
    const result = userCreateSchema.safeParse({ name, email, password });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      const { adminError } = await createUser.mutateAsync({ data: result.data, admin });
      if (adminError) {
        toast.error(
          `Usuário criado, mas não foi possível definir como admin. ${getErrorMessage(
            adminError,
            "Edite o usuário para tentar novamente.",
          )}`,
        );
      } else {
        toast.success("Usuário criado com sucesso.");
      }
      onDone();
    } catch (err) {
      showApiError(err, "Não foi possível criar o usuário.");
    }
  }

  async function handleUpdate() {
    if (!userId) return;

    const result = userUpdateSchema.safeParse({ name, email, password, admin });
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    // Senha vazia não é enviada (significa "não alterar").
    const payload: UserUpdate = {
      name: result.data.name,
      email: result.data.email,
      admin: result.data.admin,
    };
    if (result.data.password !== "") payload.password = result.data.password;

    try {
      await updateUser.mutateAsync({ id: userId, data: payload });
      toast.success("Usuário atualizado com sucesso.");
      onDone();
    } catch (err) {
      showApiError(err, "Não foi possível atualizar o usuário.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isCreate) handleCreate();
    else handleUpdate();
  }

  const describe = (field: string, hintId?: string) => {
    if (fieldErrors[field]) return { "aria-invalid": true, "aria-describedby": errorId(field) };
    return hintId ? { "aria-describedby": hintId } : {};
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="space-y-1.5">
          <Label htmlFor="user-name">Nome</Label>
          <Input
            id="user-name"
            data-autofocus=""
            placeholder="Ex. Maria Souza"
            autoComplete="off"
            maxLength={LIMITS.name.max}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearFieldError("name");
            }}
            {...describe("name")}
          />
          <FieldError id={errorId("name")} message={fieldErrors.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="user-email">E-mail</Label>
          <Input
            id="user-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="usuario@email.com"
            maxLength={LIMITS.email.max}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            {...describe("email")}
          />
          <FieldError id={errorId("email")} message={fieldErrors.email} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="user-password">{isCreate ? "Senha" : "Nova senha (opcional)"}</Label>
          <PasswordInput
            id="user-password"
            autoComplete="new-password"
            maxLength={LIMITS.password.maxBytes}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
            }}
            {...describe("password", "user-password-hint")}
          />
          {fieldErrors.password ? (
            <FieldError id={errorId("password")} message={fieldErrors.password} />
          ) : (
            <FieldHint id="user-password-hint">
              {isCreate
                ? `Mínimo de ${LIMITS.password.min} caracteres.`
                : "Deixe em branco para manter a senha atual."}
            </FieldHint>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="user-role">Permissão</Label>
          <Select value={admin ? "ADMIN" : "USER"} onValueChange={(value) => setAdmin(value === "ADMIN")}>
            <SelectTrigger id="user-role" className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">Funcionário</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
            </SelectContent>
          </Select>
          <FieldHint>Administradores também gerenciam usuários.</FieldHint>
        </div>
      </div>

      <DrawerFooter className="shrink-0 flex-col-reverse gap-2 border-t bg-background px-5 py-4 sm:flex-row sm:justify-end">
        <DrawerClose asChild>
          <Button type="button" variant="outline" className="h-10 sm:w-32" disabled={saving}>
            Cancelar
          </Button>
        </DrawerClose>
        <Button type="submit" className="h-10 sm:min-w-40" disabled={saving}>
          {saving ? "Salvando..." : isCreate ? "Salvar usuário" : "Salvar alterações"}
        </Button>
      </DrawerFooter>
    </form>
  );
}
