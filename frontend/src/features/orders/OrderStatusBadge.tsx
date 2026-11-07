import type { OrderStatus } from "@/features/orders/order-types";
import { ToneBadge } from "@/components/feedback/tone-badge";
import { formatOrderStatus } from "@/lib/formatters";
import type { Tone } from "@/lib/tones";

const statusTone: Record<OrderStatus, Tone> = {
  PENDENTE: "warning",
  CONCLUIDO: "success",
  CANCELADO: "danger",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <ToneBadge tone={statusTone[status] ?? "neutral"} className={className}>
      {formatOrderStatus(status)}
    </ToneBadge>
  );
}
