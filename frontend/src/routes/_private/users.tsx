import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CirclePlus, Search, ShieldCheck, User } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DrawerUsers } from "@/components/DrawerUsers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserService } from "@/services/user-services";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  async function getAllUsers() {
    try {
      setLoading(true);
      const userService = new UserService();
      const response = await userService.read();
      setUsers(response.map((user) => ({ ...user, admin: user.admin ?? false })));
    } catch {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-full flex-col">
      <DrawerUsers
        open={open}
        onOpenChange={setOpen}
        refreshUsers={getAllUsers}
        mode={drawerMode}
        userId={selectedUserId}
      />

      <Topbar
        title="Usuários"
        subtitle="Gerencie quem tem acesso à plataforma"
        actions={
          <Button
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => {
              setDrawerMode("create");
              setSelectedUserId(null);
              setOpen(true);
            }}
          >
            <CirclePlus className="size-3.5" />
            Novo usuário
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-6">
        <div className="relative mb-4 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuário..."
            className="h-8 pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="rounded-lg shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Usuários cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-8 text-[10px] uppercase text-muted-foreground">
                      Usuário
                    </TableHead>
                    <TableHead className="h-8 text-[10px] uppercase text-muted-foreground">
                      Cargo
                    </TableHead>
                    <TableHead className="h-8 text-right text-[10px] uppercase text-muted-foreground">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-xs text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-md border bg-muted">
                              <User className="size-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{user.name}</p>
                              <p className="text-[10px] text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1 rounded px-1.5 py-0 text-[10px] ${
                              user.admin
                                ? "border-border bg-muted"
                                : "border-border bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.admin && <ShieldCheck className="size-3" />}
                            {user.admin ? "Administrador" : "Funcionário"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setDrawerMode("edit");
                              setSelectedUserId(user.id);
                              setOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
