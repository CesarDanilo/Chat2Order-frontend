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

export const Route = createFileRoute("/_private/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex flex-col items-center">
      <Header title="Dashboard" subtitle="Visão geral da operação" />

      <main className="space-y-4 p-4 w-10/12 px-4 py-8 md:px-6 lg:px-8">
        {/* KPI */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Receita Hoje"
            value="R$ 4.850"
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
            value="128"
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
            value="14"
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
            value="9"
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
            <AlertItem
              text="12 pedidos aguardando há mais de 20 minutos"
              danger
            />

            <AlertItem text="Taxa de cancelamento aumentou hoje" danger />

            <AlertItem text="Tempo médio de entrega melhorou 8%" />
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
            <RecentOrder
              customer="Carlos Henrique"
              total="R$ 128,00"
              status="Pendente"
            />

            <RecentOrder
              customer="Douglas"
              total="R$ 89,90"
              status="Concluído"
            />

            <RecentOrder
              customer="Amanda"
              total="R$ 54,00"
              status="Cancelado"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
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
    <Card
      className="
        rounded-2xl
        border-zinc-200
        shadow-none
      "
    >
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

      <span className="text-sm font-semibold">{total}</span>
    </div>
  );
}
