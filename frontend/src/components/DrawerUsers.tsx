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
import { UserService } from "@/services/user-services";

// Validation
import z from "zod";

// Logo
import logo from "../public/icon.png";

// =========================
// TYPES
// =========================

type AlertType = "success" | "error";

interface DrawerUsersProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  refreshUsers: () => Promise<void>;

  mode: "create" | "edit";

  userId: string | null;
}

// =========================
// SCHEMA
// =========================

const userSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório"),

  email: z.email("E-mail inválido"),

  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),

  admin: z.boolean(),
});

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

      setAdmin(user.admin ?? false);
    } catch (error) {
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
    try {
      const userService = new UserService();

      const data = {
        name,
        email,
        password,
        admin,
      };

      const result = userSchema.safeParse(data);

      if (!result.success) {
        const firstError = result.error.issues[0];

        setAlert({
          show: true,
          type: "error",
          message: firstError.message,
        });

        return;
      }

      await userService.create(data);

      await refreshUsers();

      clearForm();

      setAlert({
        show: true,
        type: "success",
        message: "Usuário criado com sucesso.",
      });

      onOpenChange(false);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Não foi possível criar o usuário.",
      });
    }
  }

  // =========================
  // UPDATE USER
  // =========================

  async function updateUser() {
    try {
      if (!userId) return;

      const userService = new UserService();

      const data = {
        name,
        email,
        password,
        admin,
      };

      const result = userSchema.safeParse(data);

      if (!result.success) {
        const firstError = result.error.issues[0];

        setAlert({
          show: true,
          type: "error",
          message: firstError.message,
        });

        return;
      }

      await userService.update(userId, data);

      await refreshUsers();

      setAlert({
        show: true,
        type: "success",
        message: "Usuário atualizado com sucesso.",
      });

      onOpenChange(false);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Não foi possível atualizar o usuário.",
      });
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label className="text-sm">E-mail</Label>

                <Input
                  type="email"
                  placeholder="usuario@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label className="text-sm">Senha</Label>

                <Input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
            <Button onClick={createUser}>Salvar Usuário</Button>
          ) : (
            <Button onClick={updateUser}>Salvar Alterações</Button>
          )}

          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
