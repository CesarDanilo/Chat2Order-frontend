import type { OrderStatus } from "@/features/orders/order-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatOrderStatus } from "@/lib/formatters";

const statusStyles: Record<OrderStatus, string> = {
  PENDENTE:
    "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]",
  CONCLUIDO:
    "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-fg)]",
  CANCELADO:
    "border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-fg)]",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded px-1.5 py-0 text-[10px] font-medium shadow-none",
        statusStyles[status],
        className,
      )}
    >
      {formatOrderStatus(status)}
    </Badge>
  );
}
