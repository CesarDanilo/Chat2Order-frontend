// ===============================
// USERS PAGE
// ===============================

import { Header } from "@/components/Header";

import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";

import { CirclePlus, Search, ShieldCheck, User } from "lucide-react";

import { DrawerUsers } from "@/components/DrawerUsers";

import { useEffect, useState } from "react";

import { UserService } from "@/services/user-services";

interface IUser {
  id: string;

  name: string;

  email: string;

  admin: boolean;
}

export const Route = createFileRoute("/_private/users")({
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);

  const [open, setOpen] = useState(false);

  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  async function getAllUsers() {
    try {
      const userService = new UserService();

      const response = await userService.read();

      setUsers(response);
    } catch (error: any) {
      console.log(error);
    }
  }

  function handleCreateUser() {
    setDrawerMode("create");

    setSelectedUserId(null);

    setOpen(true);
  }

  function handleEditUser(userId: string) {
    setDrawerMode("edit");

    setSelectedUserId(userId);

    setOpen(true);
  }

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <DrawerUsers
        open={open}
        onOpenChange={setOpen}
        refreshUsers={getAllUsers}
        mode={drawerMode}
        userId={selectedUserId}
      />

      <Header
        title="Usuários"
        subtitle="Gerencie quem tem acesso à plataforma"
      />

      <main className="w-10/12 space-y-4 px-4 py-8 md:px-6 lg:px-8">
        {/* ACTIONS */}
        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search
              size={14}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-zinc-400
              "
            />

            <Input placeholder="Buscar usuário..." className="pl-9" />
          </div>

          <Button className="gap-2 rounded-xl" onClick={handleCreateUser}>
            <CirclePlus size={14} />

            <span className="text-xs">Novo usuário</span>
          </Button>
        </section>

        {/* TABLE */}
        <Card className="rounded-2xl border-zinc-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários cadastrados
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Usuário</TableHead>

                  <TableHead className="text-xs">Cargo</TableHead>

                  <TableHead className="text-right text-xs">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-zinc-200
                            bg-zinc-50
                          "
                        >
                          <User size={14} className="text-zinc-700" />
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>

                          <span className="text-xs text-zinc-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`
                          gap-1
                          border
                          hover:bg-transparent
                          ${
                            user.admin
                              ? `
                                border-blue-200
                                bg-blue-50
                                text-blue-700
                              `
                              : `
                                border-zinc-200
                                bg-zinc-100
                                text-zinc-700
                              `
                          }
                        `}
                      >
                        {user.admin && <ShieldCheck size={10} />}

                        <span className="text-xs">
                          {user.admin ? "Administrador" : "Funcionário"}
                        </span>
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleEditUser(user.id)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
