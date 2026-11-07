import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Clock3, PackageOpen, Plus, ShoppingBag, Wallet, XCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/queries/use-orders";
import type { Order } from "@/services/orders-services";
import { formatCurrency, formatPhone, formatRelativeDate } from "@/lib/formatters";
import { OrderStatusBadge } from "@/features/orders/OrderStatusBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_private/dashboard")({
  component: DashboardPage,
});

interface DashboardMetrics {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  completedOrders: number;
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
  const byStatus = (status: string) =>
    orders.filter((o) => o.status?.toUpperCase() === status).length;

  return {
    ordersToday: todayOrders.length,
    revenueToday: todayOrders.reduce((acc, o) => acc + o.total, 0),
    pendingOrders: byStatus("PENDENTE"),
    completedOrders: byStatus("CONCLUIDO"),
    cancelledOrders: byStatus("CANCELADO"),
    totalOrders: orders.length,
    totalRevenue: orders.reduce((acc, o) => acc + o.total, 0),
    recentOrders: [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      )
      .slice(0, 5),
  };
}

function DashboardPage() {
  const { data: orders = [], isLoading, isError, isFetching, refetch } = useOrders();

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Visão geral da operação"
        actions={
          <Button asChild>
            <Link to="/orders" search={{ create: true }}>
              <Plus className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Novo pedido</span>
              <span className="sr-only sm:hidden">Novo pedido</span>
            </Link>
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-5 md:px-6 md:py-6">
        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <Card className="py-0">
            <ErrorState
              title="Não foi possível carregar a visão geral"
              onRetry={() => refetch()}
              retrying={isFetching}
            />
          </Card>
        ) : (
          <DashboardContent metrics={computeMetrics(orders)} />
        )}
      </div>
    </>
  );
}

function DashboardContent({ metrics }: { metrics: DashboardMetrics }) {
  const alerts = [
    metrics.pendingOrders > 10 &&
      `${metrics.pendingOrders} pedidos pendentes aguardando atendimento.`,
    metrics.cancelledOrders > 5 && "Taxa de cancelamento elevada.",
  ].filter((alert): alert is string => typeof alert === "string");

  return (
    <>
      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <MetricCard
          label="Receita hoje"
          value={formatCurrency(metrics.revenueToday)}
          detail={`${pct(metrics.revenueToday, metrics.totalRevenue)}% da receita total`}
          icon={Wallet}
        />
        <MetricCard
          label="Pedidos hoje"
          value={metrics.ordersToday}
          detail={`${metrics.totalOrders} no total`}
          icon={ShoppingBag}
        />
        <MetricCard
          label="Pendentes"
          value={metrics.pendingOrders}
          detail={`${pct(metrics.pendingOrders, metrics.totalOrders)}% dos pedidos`}
          icon={Clock3}
        />
        <MetricCard
          label="Cancelados"
          value={metrics.cancelledOrders}
          detail={`${pct(metrics.cancelledOrders, metrics.totalOrders)}% dos pedidos`}
          icon={XCircle}
        />
      </section>

      {alerts.length > 0 && (
        <section
          aria-label="Alertas operacionais"
          className="space-y-2 rounded-lg border border-warning-border bg-warning-bg p-4 text-warning-fg"
        >
          {alerts.map((text) => (
            <p key={text} className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              {text}
            </p>
          ))}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 py-0 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b px-5 py-4 [.border-b]:pb-4">
            <CardTitle className="text-sm font-semibold">
              <h2>Pedidos recentes</h2>
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="-mr-2">
              <Link to="/orders">
                Ver todos
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            {metrics.recentOrders.length === 0 ? (
              <EmptyState
                icon={PackageOpen}
                title="Nenhum pedido registrado ainda"
                description="Os pedidos cadastrados aparecem aqui."
                action={
                  <Button asChild>
                    <Link to="/orders" search={{ create: true }}>
                      Criar pedido
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {metrics.recentOrders.map((order) => (
                  <li
                    key={order.id ?? order.customerName}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{order.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground tabular-nums">
                        {formatPhone(order.customerPhone)} · {formatRelativeDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <OrderStatusBadge status={order.status} className="hidden sm:inline-flex" />
                      <span className="w-24 text-right text-sm font-semibold tabular-nums">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <StatusSummary metrics={metrics} />
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Wallet;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-2 p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="truncate text-xl font-semibold tracking-tight tabular-nums md:text-2xl">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

// Distribuição por status: barra com texto e número (a cor nunca é a única pista).
function StatusSummary({ metrics }: { metrics: DashboardMetrics }) {
  const rows = [
    { label: "Pendentes", value: metrics.pendingOrders, bar: "bg-warning-fg" },
    { label: "Concluídos", value: metrics.completedOrders, bar: "bg-success-fg" },
    { label: "Cancelados", value: metrics.cancelledOrders, bar: "bg-danger-fg" },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b px-5 py-4 [.border-b]:pb-4">
        <CardTitle className="text-sm font-semibold">
          <h2>Pedidos por status</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {rows.map((row) => {
          const share = pct(row.value, metrics.totalOrders);
          return (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-sm">
                <span>{row.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">{row.value}</span> · {share}%
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${row.label}: ${row.value} pedidos, ${share}% do total`}
              >
                <div className={cn("h-full rounded-full", row.bar)} style={{ width: `${share}%` }} />
              </div>
            </div>
          );
        })}
        <p className="border-t pt-4 text-sm text-muted-foreground">
          Receita total{" "}
          <span className="float-right font-semibold text-foreground tabular-nums">
            {formatCurrency(metrics.totalRevenue)}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando visão geral">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[7.25rem] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
