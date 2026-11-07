import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { SearchField } from "@/components/layout/SearchField";
import { OrderDrawer } from "@/features/orders/OrderDrawer";
import { OrderTable } from "@/features/orders/OrderTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import { useDeleteOrder, useOrders } from "@/hooks/queries/use-orders";

type OrdersSearch = {
  create?: boolean;
};

export const Route = createFileRoute("/_private/orders")({
  validateSearch: (search: Record<string, unknown>): OrdersSearch => ({
    create: search.create === true || search.create === "true",
  }),
  component: OrdersPage,
});

type DrawerState = { open: boolean; mode: "create" | "edit"; orderId: string | null };

const CLOSED: DrawerState = { open: false, mode: "create", orderId: null };
const CREATING: DrawerState = { open: true, mode: "create", orderId: null };

const FILTERS = [
  { value: "Todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "concluido", label: "Concluídos" },
  { value: "cancelado", label: "Cancelados" },
];

function OrdersPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { create } = Route.useSearch();

  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>(CLOSED);

  // ?create=true (atalho da busca rápida e do dashboard) abre o painel de novo pedido.
  // Ajuste de estado durante a renderização, sem efeito: https://react.dev/learn/you-might-not-need-an-effect
  const [handledCreate, setHandledCreate] = useState(false);
  if (create && !handledCreate) {
    setHandledCreate(true);
    setDrawer(CREATING);
  } else if (!create && handledCreate) {
    setHandledCreate(false);
  }

  // Limpa o parâmetro da URL (sincroniza só o roteador).
  useEffect(() => {
    if (create) navigate({ search: { create: undefined }, replace: true });
  }, [create, navigate]);

  const { data: orders = [], isLoading, isError, isFetching, refetch } = useOrders();
  const deleteOrder = useDeleteOrder();

  const handleCreate = () => setDrawer(CREATING);
  const handleEdit = (id: string) => setDrawer({ open: true, mode: "edit", orderId: id });

  useKeyboardShortcut("n", handleCreate, { meta: true, ctrl: true });

  return (
    <>
      <OrderDrawer
        open={drawer.open}
        onOpenChange={(open) => setDrawer((prev) => ({ ...prev, open }))}
        mode={drawer.mode}
        orderId={drawer.orderId}
      />

      <Topbar
        title="Pedidos"
        subtitle="Montagem e acompanhamento de pedidos"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Novo pedido
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={search}
            onChange={setSearch}
            label="Buscar pedidos por cliente, telefone ou código"
            placeholder="Buscar por cliente, telefone ou código"
          />

          <Tabs value={filter} onValueChange={setFilter} aria-label="Filtrar por status">
            <TabsList className="w-full sm:w-auto">
              {FILTERS.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="px-2 sm:px-3">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <OrderTable
          orders={orders}
          filter={filter}
          search={search}
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          onRetry={() => refetch()}
          onEdit={handleEdit}
          onDelete={(id) => deleteOrder.mutate(id)}
          onCreate={handleCreate}
        />
      </div>
    </>
  );
}
