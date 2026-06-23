import { memo, useMemo } from "react";
import { LaptopMinimal, MessageCircle, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  formatRelativeDate,
  capitalize,
} from "@/lib/formatters";
import { OrderStatusBadge } from "@/features/orders/OrderStatusBadge";
import type { Order } from "@/services/orders-services";

interface OrderTableProps {
  orders: Order[];
  filter: string;
  search: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

interface OrderRowProps {
  order: Order;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const OrderRow = memo(function OrderRow({
  order,
  onEdit,
  onDelete,
}: OrderRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => order.id && onEdit(order.id)}
    >
      <TableCell className="px-3 py-2">
        <div className="flex flex-col text-start">
          <span className="text-xs font-medium">{order.customerName}</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            #{order.id?.slice(0, 8) ?? "-"}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-3 py-2">
        <Badge
          variant="outline"
          className={`gap-1 rounded px-1.5 py-0 text-[10px] font-medium shadow-none ${
            order.source === "WHATSAPP"
              ? "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-fg)]"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {order.source === "WHATSAPP" ? (
            <MessageCircle className="size-3" />
          ) : (
            <LaptopMinimal className="size-3" />
          )}
          {capitalize(order.source.toLowerCase())}
        </Badge>
      </TableCell>

      <TableCell className="px-3 py-2 text-center">
        <OrderStatusBadge status={order.status} />
      </TableCell>

      <TableCell className="px-3 py-2 text-end text-xs tabular-nums">
        {formatCurrency(order.total)}
      </TableCell>

      <TableCell className="px-3 py-2 text-end">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-medium">
            {formatRelativeDate(order.createdAt)}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-2 py-2 text-end" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => order.id && onEdit(order.id)}
          >
            Editar
          </Button>
          <ConfirmPopover
            title="Excluir pedido?"
            description="Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
            onConfirm={async () => {
              if (order.id) await onDelete(order.id);
            }}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              >
                Excluir
              </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  );
});

export function OrderTable({
  orders,
  filter,
  search,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
  onCreate,
}: OrderTableProps) {
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        filter === "Todos" || order.status === filter.toUpperCase();
      const matchesSearch =
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.id?.includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
        <p className="text-sm font-medium">Erro ao carregar pedidos</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Verifique sua conexão e tente novamente.
        </p>
        <Button type="button" size="sm" className="mt-4 h-8 text-xs" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
        <PackageOpen className="size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium">Nenhum pedido encontrado</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {search || filter !== "Todos"
            ? "Ajuste os filtros ou crie um novo pedido."
            : "Comece cadastrando seu primeiro pedido."}
        </p>
        <Button type="button" size="sm" className="mt-4 h-8 text-xs" onClick={onCreate}>
          Novo pedido
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-8 px-3 text-[10px] uppercase tracking-wide text-muted-foreground">
              Cliente
            </TableHead>
            <TableHead className="h-8 px-3 text-[10px] uppercase tracking-wide text-muted-foreground">
              Origem
            </TableHead>
            <TableHead className="h-8 px-3 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="h-8 px-3 text-end text-[10px] uppercase tracking-wide text-muted-foreground">
              Total
            </TableHead>
            <TableHead className="h-8 px-3 text-end text-[10px] uppercase tracking-wide text-muted-foreground">
              Data
            </TableHead>
            <TableHead className="h-8 w-28 px-2" />
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
  );
}
