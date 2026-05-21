import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react";
import { useMemo } from "react";

interface IOrderType {
  id: number;
  customer: string;
  origin: string;
  status: string;
  total: string;
  date: string;
}

interface IFilterType {
  filter: string
  search: string
}

export function TableOrders({ filter, search }: IFilterType) {

  const orders = [
    {
      id: "1",
      customer: "João Silva",
      origin: "WhatsApp",
      status: "Pendente",
      total: "R$ 320,00",
      date: "20/05/2026",
    },
    {
      id: "2",
      customer: "Maria Oliveira",
      origin: "WhatsApp",
      status: "Concluído",
      total: "R$ 1.250,00",
      date: "19/05/2026",
    },
    {
      id: "3",
      customer: "Lucas Almeida",
      origin: "WhatsApp",
      status: "Cancelado",
      total: "R$ 89,90",
      date: "18/05/2026",
    },
    {
      id: "4",
      customer: "Fernanda Costa",
      origin: "WhatsApp",
      status: "Em andamento",
      total: "R$ 540,00",
      date: "17/05/2026",
    },
    {
      id: "5",
      customer: "Rafael Martins",
      origin: "WhatsApp",
      status: "Pago",
      total: "R$ 2.430,00",
      date: "16/05/2026",
    },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        filter === "Todos" ||
        order.status === filter;

      const matchesSearch =
        order.customer
          .toLowerCase()
          .includes(search.toLowerCase())

        ||
        order.id.includes(search);
      return matchesFilter && matchesSearch;
    });

  }, [filter, search]);

  const statusColors: Record<string, string> = {
    Pendente: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    Concluído: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    Cancelado: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    "Em andamento": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    Pago: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-3 px-6 text-left text-zinc-500">Cliente</TableHead>
            <TableHead className="py-3 px-6 text-left text-zinc-500">Origem</TableHead>
            <TableHead className="px-6 py-3 text-center text-zinc-500">Status</TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">Total</TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            filteredOrders.map((order, key) => (
              <TableRow key={key}>
                <TableCell className="px-6 py-3">
                  <div className="flex flex-col text-start">
                    <span className="text-xs font-semibold">
                      {order.customer}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      #{order.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3 text-left ">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-green-500" />
                    <span className="text-zinc-500 text-xs">{order.origin}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3 text-center">
                  <Badge className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-3 text-end text-xs">{order.total}</TableCell>
                <TableCell className="px-6 py-3 text-end text-xs">{order.date}</TableCell>
              </TableRow>

            ))
          }
        </TableBody>
      </Table>
    </div>
  )
}