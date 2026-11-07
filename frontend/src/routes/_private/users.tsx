import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, SearchX, ShieldCheck, Users } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { SearchField } from "@/components/layout/SearchField";
import { DrawerUsers } from "@/components/DrawerUsers";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { ToneBadge } from "@/components/feedback/tone-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsers } from "@/hooks/queries/use-users";
import { getStoredUser } from "@/lib/session";

export const Route = createFileRoute("/_private/users")({
  beforeLoad: () => {
    if (getStoredUser()?.admin !== true) throw redirect({ to: "/dashboard" });
  },
  component: UsersPage,
});

type DrawerState = { open: boolean; mode: "create" | "edit"; userId: string | null };

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2);
  return (letters ?? "?").toUpperCase();
}

function RoleBadge({ admin }: { admin: boolean }) {
  return admin ? (
    <ToneBadge tone="success" className="gap-1">
      <ShieldCheck aria-hidden="true" />
      Administrador
    </ToneBadge>
  ) : (
    <ToneBadge tone="neutral">Funcionário</ToneBadge>
  );
}

function UsersPage() {
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, mode: "create", userId: null });

  const { data: users = [], isLoading, isError, isFetching, refetch } = useUsers();

  const term = search.trim().toLowerCase();
  const filtered = users.filter(
    (u) => !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
  );

  const handleCreate = () => setDrawer({ open: true, mode: "create", userId: null });
  const handleEdit = (id: string) => setDrawer({ open: true, mode: "edit", userId: id });

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <div className="divide-y" aria-busy="true" aria-label="Carregando usuários">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <ErrorState
        title="Não foi possível carregar os usuários"
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  } else if (filtered.length === 0) {
    content = users.length === 0 ? (
      <EmptyState
        icon={Users}
        title="Nenhum usuário cadastrado"
        description="Convide quem vai atender os pedidos."
        action={
          <Button onClick={handleCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Cadastrar usuário
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={SearchX}
        title="Nenhum usuário encontrado"
        description="Busque por outro nome ou e-mail."
      />
    );
  } else {
    content = (
      <>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 text-xs text-muted-foreground">Usuário</TableHead>
                <TableHead className="text-xs text-muted-foreground">Permissão</TableHead>
                <TableHead className="pr-3">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-3 pl-4">
                    <UserIdentity name={user.name} email={user.email} />
                  </TableCell>
                  <TableCell className="py-3">
                    <RoleBadge admin={user.admin} />
                  </TableCell>
                  <TableCell className="py-3 pr-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user.id)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ul className="divide-y md:hidden" aria-label="Usuários">
          {filtered.map((user) => (
            <li key={user.id} className="space-y-3 px-4 py-4">
              <UserIdentity name={user.name} email={user.email} />
              <div className="flex items-center justify-between gap-2">
                <RoleBadge admin={user.admin} />
                <Button variant="ghost" size="sm" className="-mr-2" onClick={() => handleEdit(user.id)}>
                  Editar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <DrawerUsers
        open={drawer.open}
        onOpenChange={(open) => setDrawer((prev) => ({ ...prev, open }))}
        mode={drawer.mode}
        userId={drawer.userId}
      />

      <Topbar
        title="Usuários"
        subtitle="Quem tem acesso à plataforma"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Novo usuário
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-5 md:px-6 md:py-6">
        <SearchField
          value={search}
          onChange={setSearch}
          label="Buscar usuários por nome ou e-mail"
          placeholder="Buscar por nome ou e-mail"
        />

        <section aria-labelledby="users-title" className="max-w-4xl overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 id="users-title" className="text-sm font-semibold">
              Usuários cadastrados
            </h2>
            {!isLoading && !isError ? (
              <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
                {filtered.length === users.length
                  ? `${users.length} no total`
                  : `${filtered.length} de ${users.length}`}
              </span>
            ) : null}
          </div>
          {content}
        </section>
      </div>
    </>
  );
}

function UserIdentity({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
      >
        {initials(name)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-sm text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
