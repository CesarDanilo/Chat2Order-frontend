// ===============================
// DRAWER USERS
// ===============================

import { useEffect, useState } from "react";

// Components
import { Button } from "@/components/ui/button";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent } from "@/components/ui/card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icons
import { ShieldCheck, User2 } from "lucide-react";

// Services
import { UserService, type UserUpdate } from "@/services/user-services";

// Validation
import { LIMITS, userCreateSchema, userUpdateSchema, zodFieldErrors } from "@/lib/validation";
import { getApiFieldErrors, getErrorMessage, getGenericErrorMessage } from "@/lib/api-error";

// Logo
import logo from "../public/icon.png";

// =========================
// TYPES
// =========================

type AlertType = "success" | "error";

type FieldErrors = Record<string, string>;

// Campos mostrados junto ao input. Erros de outros campos vão para o alerta.
const USER_FIELDS = ["name", "email", "password"];

interface DrawerUsersProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  refreshUsers: () => Promise<void>;

  mode: "create" | "edit";

  userId: string | null;
}

// =========================
// HELPERS
// =========================

function withoutKey(errors: FieldErrors, field: string): FieldErrors {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

// =========================
// COMPONENT
// =========================

export function DrawerUsers({
  open,
  onOpenChange,
  refreshUsers,
  mode,
  userId,
}: DrawerUsersProps) {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [admin, setAdmin] = useState(false);

  const [saving, setSaving] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [alert, setAlert] = useState<{
    show: boolean;
    type: AlertType;
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // =========================
  // ALERT AUTO CLOSE
  // =========================

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({
          ...prev,
          show: false,
        }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  // =========================
  // CLEAR FORM
  // =========================

  function clearForm() {
    setName("");

    setEmail("");

    setPassword("");

    setAdmin(false);

    setFieldErrors({});
  }

  function clearFieldError(field: string) {
    setFieldErrors((prev) => withoutKey(prev, field));
  }

  // =========================
  // EFFECTS
  // =========================

  useEffect(() => {
    if (open && mode === "create") {
      clearForm();
    }
  }, [open, mode]);

  useEffect(() => {
    if (open && mode === "edit" && userId) {
      getUser();
    }
  }, [open, mode, userId]);

  // =========================
  // GET USER
  // =========================

  async function getUser() {
    try {
      if (!userId) return;

      const userService = new UserService();

      const user = await userService.readById(userId);

      setName(user.name);

      setEmail(user.email);

      // Na edição a senha é opcional: começa vazia e só é enviada se preenchida.
      setPassword("");

      setAdmin(user.admin ?? false);

      setFieldErrors({});
    } catch {
      setAlert({
        show: true,
        type: "error",
        message: "Não foi possível buscar o usuário.",
      });
    }
  }

  // =========================
  // CREATE USER
  // =========================

  async function createUser() {
    // Validação no cliente só para UX; o backend valida de novo.
    const result = userCreateSchema.safeParse({ name, email, password });

    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }

    setFieldErrors({});

    try {
      setSaving(true);

      const userService = new UserService();

      // POST sem `admin`: o backend recusa o campo na criação.
      const created = await userService.create(result.data);

      if (admin) {
        try {
          await userService.update(created.id, {
            name: result.data.name,
            email: result.data.email,
            admin: true,
          });
        } catch (err) {
          await refreshUsers();

          setAlert({
            show: true,
            type: "error",
            message: `Usuário criado, mas não foi possível definir como admin. ${getErrorMessage(
              err,
              "Edite o usuário para tentar novamente.",
            )}`,
          });

          onOpenChange(false);

          return;
        }
      }

      await refreshUsers();

      clearForm();

      setAlert({
        show: true,
        type: "success",
        message: "Usuário criado com sucesso.",
      });

      onOpenChange(false);
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));

      const message = getGenericErrorMessage(err, "Não foi possível criar o usuário.", USER_FIELDS);
      if (message) {
        setAlert({ show: true, type: "error", message });
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // UPDATE USER
  // =========================

  async function updateUser() {
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

    if (result.data.password !== "") {
      payload.password = result.data.password;
    }

    try {
      setSaving(true);

      const userService = new UserService();

      await userService.update(userId, payload);

      await refreshUsers();

      setAlert({
        show: true,
        type: "success",
        message: "Usuário atualizado com sucesso.",
      });

      onOpenChange(false);
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));

      const message = getGenericErrorMessage(err, "Não foi possível atualizar o usuário.", USER_FIELDS);
      if (message) {
        setAlert({ show: true, type: "error", message });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      {alert.show && (
        <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
          <Alert
            className={`
              w-[350px]
              border
              shadow-lg
              ${
                alert.type === "success"
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }
            `}
          >
            <AlertTitle>
              {alert.type === "success"
                ? `Usuário ${
                    mode === "create" ? "criado" : "atualizado"
                  } com sucesso`
                : "Erro"}
            </AlertTitle>

            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <DrawerContent className="ml-auto h-screen max-w-xl">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-3 px-2 py-2">
            <div className="w-6">
              <img src={logo} alt="logo" />
            </div>

            <div>
              {mode === "create" ? "Novo Usuário" : "Editar Usuário"}

              <DrawerDescription className="text-xs">
                {mode === "create"
                  ? "Cadastre um novo usuário na plataforma."
                  : "Atualize as informações do usuário."}
              </DrawerDescription>
            </div>
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Card>
            <CardContent className="space-y-5 p-5">
              {/* NAME */}
              <div className="space-y-2">
                <Label className="text-sm">Nome</Label>

                <div className="relative">
                  <User2
                    size={14}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-zinc-400
                    "
                  />

                  <Input
                    placeholder="Ex. César Danilo"
                    maxLength={LIMITS.name.max}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError("name");
                    }}
                    aria-invalid={!!fieldErrors.name}
                    className="pl-9"
                  />
                </div>

                {fieldErrors.name && (
                  <p className="text-[10px] text-destructive">{fieldErrors.name}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label className="text-sm">E-mail</Label>

                <Input
                  type="email"
                  placeholder="usuario@email.com"
                  maxLength={LIMITS.email.max}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  aria-invalid={!!fieldErrors.email}
                />

                {fieldErrors.email && (
                  <p className="text-[10px] text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label className="text-sm">Senha</Label>

                <Input
                  type="password"
                  placeholder="********"
                  maxLength={LIMITS.password.maxBytes}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  aria-invalid={!!fieldErrors.password}
                />

                {fieldErrors.password ? (
                  <p className="text-[10px] text-destructive">{fieldErrors.password}</p>
                ) : (
                  mode === "edit" && (
                    <p className="text-[10px] text-muted-foreground">
                      Deixe em branco para manter a senha atual.
                    </p>
                  )
                )}
              </div>

              {/* ADMIN */}
              <div className="space-y-2">
                <Label className="text-sm">Permissão</Label>

                <Select
                  value={admin ? "ADMIN" : "USER"}
                  onValueChange={(value) => setAdmin(value === "ADMIN")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-blue-600" />
                        Admin
                      </div>
                    </SelectItem>

                    <SelectItem value="USER">Usuário comum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <DrawerFooter className="border-t">
          {mode === "create" ? (
            <Button onClick={createUser} disabled={saving}>
              Salvar Usuário
            </Button>
          ) : (
            <Button onClick={updateUser} disabled={saving}>
              Salvar Alterações
            </Button>
          )}

          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
