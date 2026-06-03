import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock3,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { OrderService } from "@/services/orders-services";
import type { Order } from "@/services/orders-services";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_private/dashboard")({
  component: DashboardPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardMetrics {
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/** Retorna a % de `part` em relação a `total`, arredondada. */
function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/** Formata o label de tendência: "32%" ou "0%" */
function trendLabel(part: number, total: number): string {
  return `${pct(part, total)}%`;
}

function formatStatus(status: string): string {
  if (status.toUpperCase() === "CONCLUIDO") return "Concluído";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// ─── Compute metrics (pure function — fácil de testar) ───────────────────────

function computeMetrics(orders: Order[]): DashboardMetrics {
  const todayOrders = orders.filter((o) => isToday(o.createdAt));

  const revenueToday = todayOrders.reduce((acc, o) => acc + o.total, 0);

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter(
    (o) => o.status?.toUpperCase() === "PENDENTE"
  ).length;

  const cancelledOrders = orders.filter(
    (o) => o.status?.toUpperCase() === "CANCELADO"
  ).length;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 3);

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

// ─── Page ─────────────────────────────────────────────────────────────────────

const orderService = new OrderService();

function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    orderService
      .read()
      .then((orders) => {
        if (cancelled) return;
        setMetrics(computeMetrics(orders));
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <span className="text-xs text-zinc-400">Carregando...</span>
      </div>
    );
  }

  const {
    ordersToday,
    revenueToday,
    pendingOrders,
    cancelledOrders,
    totalOrders,
    totalRevenue,
    recentOrders,
  } = metrics;

  return (
    <div className="flex flex-col items-center bg-zinc-50 h-screen">
      <Header title="Dashboard" subtitle="Visão geral da operação" />

      <main className="w-10/12 space-y-4 px-4 py-8 md:px-6 lg:px-8">
        {/* KPI */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Receita Hoje"
            value={`R$ ${revenueToday.toFixed(2)}`}
            trend={trendLabel(revenueToday, totalRevenue)}
            positive={pct(revenueToday, totalRevenue) >= 20}
            icon={<DollarSign size={14} />}
            iconClassName="border-green-200 bg-green-50 text-green-700"
          />

          <MetricCard
            title="Pedidos Hoje"
            value={ordersToday}
            trend={trendLabel(ordersToday, totalOrders)}
            positive={pct(ordersToday, totalOrders) >= 20}
            icon={<ShoppingBag size={14} />}
            iconClassName="border-blue-200 bg-blue-50 text-blue-700"
          />

          <MetricCard
            title="Pendentes"
            value={pendingOrders}
            trend={trendLabel(pendingOrders, totalOrders)}
            positive={pct(pendingOrders, totalOrders) < 30}
            icon={<Clock3 size={14} />}
            iconClassName="border-amber-200 bg-amber-50 text-amber-700"
          />

          <MetricCard
            title="Cancelamentos"
            value={cancelledOrders}
            trend={trendLabel(cancelledOrders, totalOrders)}
            positive={false}
            icon={<AlertTriangle size={14} />}
            iconClassName="border-red-200 bg-red-50 text-red-700"
          />
        </section>

        {/* ALERTAS */}
        <Card className="rounded-2xl border-zinc-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas operacionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingOrders > 10 && (
              <AlertItem
                text={`${pendingOrders} pedidos pendentes aguardando atendimento`}
                danger
              />
            )}
            {cancelledOrders > 5 && (
              <AlertItem text="Taxa de cancelamento aumentou hoje" danger />
            )}
            {ordersToday > 0 && (
              <AlertItem text={`${ordersToday} pedidos registrados hoje`} />
            )}
          </CardContent>
        </Card>

        {/* OPERAÇÃO RECENTE */}
        <Card className="rounded-2xl border-zinc-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Operação recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.map((item) => (
              <RecentOrder
                key={item.id ?? item.customerName}
                customer={item.customerName}
                total={item.total}
                status={formatStatus(item.status)}
              />
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  positive?: boolean;
  icon: React.ReactNode;
  iconClassName?: string;
}

function MetricCard({
  title,
  value,
  trend,
  positive = true,
  icon,
  iconClassName,
}: MetricCardProps) {
  return (
    <Card className="rounded-2xl border-zinc-200 shadow-none">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="text-xs text-zinc-500">{title}</p>
          <h2 className="text-xl font-semibold tracking-tight">{value}</h2>
          <div
            className={`flex items-center gap-1 text-xs ${
              positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            <span>{trend} do total</span>
          </div>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${iconClassName}`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertItemProps {
  text: string;
  danger?: boolean;
}

function AlertItem({ text, danger = false }: AlertItemProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
        danger
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-700"
      }`}
    >
      <AlertTriangle size={12} />
      <span>{text}</span>
    </div>
  );
}

interface RecentOrderProps {
  customer: string;
  total: number;
  status: string;
}

function RecentOrder({ customer, total, status }: RecentOrderProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{customer}</span>
        <span className="text-xs text-zinc-500">{status}</span>
      </div>
      <span className="text-sm font-semibold">R$ {total.toFixed(2)}</span>
    </div>
  );
}