import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CirclePlus, SearchIcon } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { OrderDrawer } from "@/features/orders/OrderDrawer";
import { OrderTable } from "@/features/orders/OrderTable";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import {
  useDeleteOrder,
  useOrders,
} from "@/hooks/queries/use-orders";

type OrdersSearch = {
  create?: boolean;
};

export const Route = createFileRoute("/_private/orders")({
  validateSearch: (search: Record<string, unknown>): OrdersSearch => ({
    create: search.create === true || search.create === "true",
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { create } = Route.useSearch();

  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading, isError, refetch } = useOrders();
  const deleteOrder = useDeleteOrder();

  function handleCreate() {
    setDrawerMode("create");
    setSelectedOrderId(null);
    setOpen(true);
  }

  function handleEdit(id: string) {
    setDrawerMode("edit");
    setSelectedOrderId(id);
    setOpen(true);
  }

  function handleDelete(id: string) {
    deleteOrder.mutate(id);
  }

  useEffect(() => {
    if (create) {
      handleCreate();
      navigate({ search: { create: undefined }, replace: true });
    }
  }, [create]);

  useKeyboardShortcut("n", handleCreate, { meta: true, ctrl: true });

  return (
    <div className="flex min-h-full flex-col">
      <OrderDrawer
        open={open}
        onOpenChange={setOpen}
        mode={drawerMode}
        orderId={selectedOrderId}
      />

      <Topbar
        title="Pedidos"
        subtitle="Montagem e acompanhamento de pedidos"
        actions={
          <Button
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={handleCreate}
          >
            <CirclePlus className="size-3.5" />
            Novo pedido
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="h-8 w-full lg:max-w-xs">
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente ou ID"
              className="text-xs"
            />
            <InputGroupAddon>
              <SearchIcon className="size-3.5" />
            </InputGroupAddon>
          </InputGroup>

          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="h-8">
              <TabsTrigger value="Todos" className="px-2 text-xs">
                Todos
              </TabsTrigger>
              <TabsTrigger value="pendente" className="px-2 text-xs">
                Pendentes
              </TabsTrigger>
              <TabsTrigger value="concluido" className="px-2 text-xs">
                Concluídos
              </TabsTrigger>
              <TabsTrigger value="cancelado" className="px-2 text-xs">
                Cancelados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4">
          <OrderTable
            orders={orders}
            filter={filter}
            search={search}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        </div>
      </div>
    </div>
  );
}
