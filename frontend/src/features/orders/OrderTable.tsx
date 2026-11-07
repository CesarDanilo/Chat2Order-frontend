import { memo, useMemo } from "react";
import { LaptopMinimal, MessageCircle, PackageOpen, Phone, Plus, SearchX } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { ConfirmPopover } from "@/components/ui/confirm-popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDateTime,
  formatPhone,
  formatRelativeDate,
} from "@/lib/formatters";
import { OrderStatusBadge } from "@/features/orders/OrderStatusBadge";
import type { Order } from "@/services/orders-services";

interface OrderTableProps {
  orders: Order[];
  filter: string;
  search: string;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

interface OrderItemProps {
  order: Order;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const SOURCE_LABEL: Record<Order["source"], string> = { WHATSAPP: "WhatsApp", SITE: "Site" };

function SourceLabel({ source }: { source: Order["source"] }) {
  const Icon = source === "WHATSAPP" ? MessageCircle : LaptopMinimal;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="size-4" aria-hidden="true" />
      {SOURCE_LABEL[source] ?? source}
    </span>
  );
}

function OrderActions({ order, onEdit, onDelete }: OrderItemProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => order.id && onEdit(order.id)}
      >
        Editar
      </Button>
      <ConfirmPopover
        title="Excluir pedido?"
        description={`O pedido de ${order.customerName} será removido. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (order.id) await onDelete(order.id);
        }}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Excluir
          </Button>
        }
      />
    </div>
  );
}

const OrderRow = memo(function OrderRow({ order, onEdit, onDelete }: OrderItemProps) {
  return (
    <TableRow className="cursor-pointer" onClick={() => order.id && onEdit(order.id)}>
      <TableCell className="py-3 pl-4">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{order.customerName}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatPhone(order.customerPhone)}
            <span aria-hidden="true"> · </span>
            <span className="sr-only">, código </span>#{order.id?.slice(0, 8) ?? "-"}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <SourceLabel source={order.source} />
      </TableCell>
      <TableCell className="py-3">
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="py-3 text-right font-medium tabular-nums">
        {formatCurrency(order.total)}
      </TableCell>
      <TableCell className="py-3 text-right">
        <div className="flex flex-col items-end">
          <span className="text-sm">{formatRelativeDate(order.createdAt)}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3 pr-3" onClick={(e) => e.stopPropagation()}>
        <OrderActions order={order} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
});

// Celular: cada pedido vira um cartão (sem rolagem horizontal).
const OrderCard = memo(function OrderCard({ order, onEdit, onDelete }: OrderItemProps) {
  return (
    <li className="space-y-3 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{order.customerName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
            <Phone className="size-3.5 shrink-0" aria-hidden="true" />
            {formatPhone(order.customerPhone)}
          </p>
        </div>
        <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(order.total)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <OrderStatusBadge status={order.status} />
        <SourceLabel source={order.source} />
        <span className="text-sm text-muted-foreground">{formatRelativeDate(order.createdAt)}</span>
      </div>
      <div className="-mx-2 -mb-1 border-t pt-2">
        <OrderActions order={order} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </li>
  );
});

function matchesSearch(order: Order, search: string) {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  const digits = term.replace(/\D/g, "");
  return (
    order.customerName.toLowerCase().includes(term) ||
    (order.id?.toLowerCase().includes(term) ?? false) ||
    (digits.length >= 3 && order.customerPhone.replace(/\D/g, "").includes(digits))
  );
}

function OrdersSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando pedidos">
      <div className="hidden divide-y md:block">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      <div className="divide-y md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 px-4 py-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderTable({
  orders,
  filter,
  search,
  isLoading,
  isError,
  isFetching,
  onRetry,
  onEdit,
  onDelete,
  onCreate,
}: OrderTableProps) {
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (filter === "Todos" || order.status === filter.toUpperCase()) &&
          matchesSearch(order, search),
      ),
    [orders, filter, search],
  );

  let content: React.ReactNode;

  if (isLoading) {
    content = <OrdersSkeleton />;
  } else if (isError) {
    content = (
      <ErrorState title="Não foi possível carregar os pedidos" onRetry={onRetry} retrying={isFetching} />
    );
  } else if (orders.length === 0) {
    content = (
      <EmptyState
        icon={PackageOpen}
        title="Nenhum pedido ainda"
        description="Cadastre o primeiro pedido recebido pelo WhatsApp ou pelo site."
        action={
          <Button type="button" onClick={onCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Criar pedido
          </Button>
        }
      />
    );
  } else if (filteredOrders.length === 0) {
    content = (
      <EmptyState
        icon={SearchX}
        title="Nenhum pedido encontrado"
        description="Ajuste a busca ou o filtro de status para ver outros pedidos."
      />
    );
  } else {
    content = (
      <>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 text-xs text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-xs text-muted-foreground">Origem</TableHead>
                <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">Total</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">Data</TableHead>
                <TableHead className="pr-3">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id ?? order.customerName}
                  order={order}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <ul className="divide-y md:hidden" aria-label="Pedidos">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id ?? order.customerName}
              order={order}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border bg-card">{content}</div>
      {!isLoading && !isError && orders.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
          {filteredOrders.length === orders.length
            ? `${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"}`
            : `${filteredOrders.length} de ${orders.length} pedidos`}
        </p>
      ) : null}
    </div>
  );
}
