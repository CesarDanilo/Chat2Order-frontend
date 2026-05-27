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

import { useEffect, useState } from "react";

export const Route = createFileRoute("/_private/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [ordersToday, setOrdersToday] = useState(0);

  const [recipeToday, setRecipeToday] = useState(0);

  const [pendingOrders, setPendingOrders] = useState(0);

  const [cancelledOrders, setCancelledOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  function UpperCaseStatus(status: string) {
    return status.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  async function loadDashboard() {
    try {
      const orderService = new OrderService();

      const orders = await orderService.read();

      const today = new Date();

      // PEDIDOS DE HOJE
      const todayOrders = orders.filter((order) => {
        const createdAt = new Date(order.createdAt);

        return (
          createdAt.getDate() === today.getDate() &&
          createdAt.getMonth() === today.getMonth() &&
          createdAt.getFullYear() === today.getFullYear()
        );
      });

      // RECEITA
      const totalRecipe = todayOrders.reduce((acc, order) => {
        return acc + order.total;
      }, 0);

      // PENDENTES
      const pending = orders.filter((order) => order.status === "PENDENTE");

      // CANCELADOS
      const cancelled = orders.filter((order) => order.status === "CANCELADO");

      const sortedOrders = orders.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      const recent = sortedOrders.slice(0, 3);
      setRecentOrders(recent);

      setOrdersToday(todayOrders.length);

      setRecipeToday(totalRecipe);

      setPendingOrders(pending.length);

      setCancelledOrders(cancelled.length);
    } catch (error) {
      console.log(error);

      setOrdersToday(0);

      setRecipeToday(0);

      setPendingOrders(0);

      setCancelledOrders(0);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <Header title="Dashboard" subtitle="Visão geral da operação" />

      <main className="w-10/12 space-y-4 px-4 py-8 md:px-6 lg:px-8">
        {/* KPI */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Receita Hoje"
            value={`R$ ${recipeToday.toFixed(2)}`}
            trend="+12%"
            positive
            icon={<DollarSign size={14} />}
            iconClassName="
              border-green-200
              bg-green-50
              text-green-700
            "
          />

          <MetricCard
            title="Pedidos Hoje"
            value={ordersToday}
            trend="+8%"
            positive
            icon={<ShoppingBag size={14} />}
            iconClassName="
              border-blue-200
              bg-blue-50
              text-blue-700
            "
          />

          <MetricCard
            title="Pendentes"
            value={pendingOrders}
            trend="-2%"
            positive
            icon={<Clock3 size={14} />}
            iconClassName="
              border-amber-200
              bg-amber-50
              text-amber-700
            "
          />

          <MetricCard
            title="Cancelamentos"
            value={cancelledOrders}
            trend="+5%"
            positive={false}
            icon={<AlertTriangle size={14} />}
            iconClassName="
              border-red-200
              bg-red-50
              text-red-700
            "
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
                customer={item.customerName}
                total={item.total}
                status={
                  item.status === "CONCLUIDO"
                    ? "Concluído"
                    : UpperCaseStatus(item.status.toLowerCase())
                }
              />
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

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
            className={`
              flex
              items-center
              gap-1
              text-xs
              ${positive ? "text-green-600" : "text-red-600"}
            `}
          >
            {positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}

            <span>{trend}</span>
          </div>
        </div>

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            ${iconClassName}
          `}
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
      className={`
        flex
        items-center
        gap-2
        rounded-xl
        border
        px-3
        py-2
        text-xs
        ${
          danger
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-zinc-200 bg-zinc-50 text-zinc-700"
        }
      `}
    >
      <AlertTriangle size={12} />

      <span>{text}</span>
    </div>
  );
}

interface RecentOrderProps {
  customer: string;

  total: string;

  status: string;
}

function RecentOrder({ customer, total, status }: RecentOrderProps) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-zinc-200
        px-3
        py-3
      "
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">{customer}</span>

        <span className="text-xs text-zinc-500">{status}</span>
      </div>

      <span className="text-sm font-semibold">R$ {total}</span>
    </div>
  );
}
