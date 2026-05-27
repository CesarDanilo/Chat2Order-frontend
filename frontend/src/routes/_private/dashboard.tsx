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
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        subtitle="Visão geral da operação da sua loja"
      />

      <main className="space-y-6 p-6">
        {/* KPI */}
        <section
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          <MetricCard
            title="Receita Hoje"
            value="R$ 4.850"
            trend="+12%"
            positive
            icon={<DollarSign size={16} />}
          />

          <MetricCard
            title="Pedidos Hoje"
            value="128"
            trend="+8%"
            positive
            icon={<ShoppingBag size={16} />}
          />

          <MetricCard
            title="Pendentes"
            value="14"
            trend="-2%"
            positive
            icon={<Clock3 size={16} />}
          />

          <MetricCard
            title="Cancelamentos"
            value="9"
            trend="+5%"
            positive={false}
            icon={<AlertTriangle size={16} />}
          />
        </section>

        {/* ALERTAS */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-3xl border-zinc-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Alertas Operacionais
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <AlertItem
                text="12 pedidos aguardando há mais de 20 minutos"
                danger
              />

              <AlertItem text="Taxa de cancelamento aumentou hoje" danger />

              <AlertItem text="Tempo médio de entrega melhorou 8%" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-zinc-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                IA & Automação
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <AutomationMetric label="Pedidos importados IA" value="92%" />

              <AutomationMetric label="Precisão da IA" value="96%" />

              <AutomationMetric label="Revisões manuais" value="4%" />
            </CardContent>
          </Card>
        </section>

        {/* PEDIDOS RECENTES */}
        <Card className="rounded-3xl border-zinc-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Operação recente
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
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
}

function MetricCard({
  title,
  value,
  trend,
  positive = true,
  icon,
}: MetricCardProps) {
  return (
    <Card
      className="
        rounded-3xl
        border-zinc-200
        shadow-none
        transition-all
        duration-200
        hover:border-zinc-300
        hover:bg-zinc-50/50
      "
    >
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-zinc-500">{title}</p>

          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {value}
          </h2>

          <div
            className={`
              flex
              items-center
              gap-1
              text-xs
              font-medium
              ${positive ? "text-emerald-600" : "text-red-500"}
            `}
          >
            {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}

            {trend}
          </div>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-zinc-200
            bg-zinc-100
            text-zinc-700
          "
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
        rounded-2xl
        border
        px-3
        py-3
        ${
          danger
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-zinc-200 bg-zinc-50 text-zinc-700"
        }
      `}
    >
      <AlertTriangle size={14} />

      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}

interface AutomationMetricProps {
  label: string;
  value: string;
}

function AutomationMetric({ label, value }: AutomationMetricProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500">{label}</span>

      <span className="text-sm font-semibold text-zinc-900">{value}</span>
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
        rounded-2xl
        border
        border-zinc-200
        px-4
        py-3
        transition-all
        duration-200
        hover:bg-zinc-50
      "
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-zinc-900">{customer}</span>

        <span className="text-xs text-zinc-500">{status}</span>
      </div>

      <span className="text-sm font-semibold text-zinc-900">{total}</span>
    </div>
  );
}
