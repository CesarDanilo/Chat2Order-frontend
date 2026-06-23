import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock3,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { useOrders } from "@/hooks/queries/use-orders";
import type { Order } from "@/services/orders-services";
import { formatCurrency } from "@/lib/formatters";
import { OrderStatusBadge } from "@/features/orders/OrderStatusBadge";

export const Route = createFileRoute("/_private/dashboard")({
  component: DashboardPage,
});

interface DashboardMetrics {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

function isToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function computeMetrics(orders: Order[]): DashboardMetrics {
  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const revenueToday = todayOrders.reduce((acc, o) => acc + o.total, 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(
    (o) => o.status?.toUpperCase() === "PENDENTE",
  ).length;
  const cancelledOrders = orders.filter(
    (o) => o.status?.toUpperCase() === "CANCELADO",
  ).length;
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    )
    .slice(0, 5);

  return {
    ordersToday: todayOrders.length,
    revenueToday,
    pendingOrders,
    cancelledOrders,
    totalOrders: orders.length,
    totalRevenue,
    recentOrders,
  };
}

function DashboardPage() {
  const { data: orders = [], isLoading, isError, refetch } = useOrders();

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-col">
        <Topbar title="Dashboard" subtitle="Visão geral da operação" />
        <div className="mx-auto w-full max-w-6xl space-y-3 p-4 md:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-full flex-col">
        <Topbar title="Dashboard" subtitle="Visão geral da operação" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <p className="text-sm">Erro ao carregar dados</p>
          <Button size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const metrics = computeMetrics(orders);

  return (
    <div className="flex min-h-full flex-col">
      <Topbar title="Dashboard" subtitle="Visão geral da operação" />

      <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Receita hoje"
            value={formatCurrency(metrics.revenueToday)}
            trend={`${pct(metrics.revenueToday, metrics.totalRevenue)}%`}
            positive={pct(metrics.revenueToday, metrics.totalRevenue) >= 20}
            icon={<DollarSign className="size-3.5" />}
            tone="success"
          />
          <MetricCard
            title="Pedidos hoje"
            value={metrics.ordersToday}
            trend={`${pct(metrics.ordersToday, metrics.totalOrders)}%`}
            positive={pct(metrics.ordersToday, metrics.totalOrders) >= 20}
            icon={<ShoppingBag className="size-3.5" />}
            tone="neutral"
          />
          <MetricCard
            title="Pendentes"
            value={metrics.pendingOrders}
            trend={`${pct(metrics.pendingOrders, metrics.totalOrders)}%`}
            positive={pct(metrics.pendingOrders, metrics.totalOrders) < 30}
            icon={<Clock3 className="size-3.5" />}
            tone="warning"
          />
          <MetricCard
            title="Cancelamentos"
            value={metrics.cancelledOrders}
            trend={`${pct(metrics.cancelledOrders, metrics.totalOrders)}%`}
            positive={false}
            icon={<AlertTriangle className="size-3.5" />}
            tone="error"
          />
        </section>

        {(metrics.pendingOrders > 10 || metrics.cancelledOrders > 5) && (
          <Card className="rounded-lg shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">
                Alertas operacionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.pendingOrders > 10 && (
                <AlertItem
                  text={`${metrics.pendingOrders} pedidos pendentes aguardando atendimento`}
                  danger
                />
              )}
              {metrics.cancelledOrders > 5 && (
                <AlertItem text="Taxa de cancelamento elevada hoje" danger />
              )}
            </CardContent>
          </Card>
        )}

        <Card className="rounded-lg shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium">Operação recente</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link to="/orders">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {metrics.recentOrders.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Nenhum pedido registrado ainda.
                </p>
                <Button size="sm" className="mt-3 h-8 text-xs" asChild>
                  <Link to="/orders" search={{ create: true }}>
                    Criar pedido
                  </Link>
                </Button>
              </div>
            ) : (
              metrics.recentOrders.map((item) => (
                <div
                  key={item.id ?? item.customerName}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {item.customerName}
                    </p>
                    <div className="mt-0.5">
                      <OrderStatusBadge status={item.status} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold tabular-nums">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  positive,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  trend: string;
  positive: boolean;
  icon: React.ReactNode;
  tone: "success" | "warning" | "error" | "neutral";
}) {
  const toneClass = {
    success: "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-fg)]",
    warning: "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]",
    error: "border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-fg)]",
    neutral: "border-border bg-muted text-muted-foreground",
  }[tone];

  return (
    <Card className="rounded-lg shadow-none">
      <CardContent className="flex items-center justify-between p-3">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
          <div
            className={`flex items-center gap-1 text-[10px] ${
              positive ? "text-[var(--status-success-fg)]" : "text-[var(--status-error-fg)]"
            }`}
          >
            {positive ? <ArrowUp className="size-2.5" /> : <ArrowDown className="size-2.5" />}
            <span>{trend} do total</span>
          </div>
        </div>
        <div
          className={`flex size-8 items-center justify-center rounded-md border ${toneClass}`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
        danger
          ? "border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-fg)]"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      <AlertTriangle className="size-3 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
