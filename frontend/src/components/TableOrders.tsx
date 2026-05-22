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
import { useEffect, useMemo, useState } from "react";
import { OrderService, type Order } from "@/services/orders-services";
import { Spinner } from "@/components/ui/spinner"

interface IFilterType {
  filter: string
  search: string
}

export function TableOrders({ filter, search }: IFilterType) {
  const [orders, setOrders] = useState<Order[]>([]);
  const orderService = new OrderService();
  const [isLoading, setIsLoading] = useState(true);

  async function loadOrders() {
    try {
      setIsLoading(true);
      const orders = await orderService.read()
      setOrders(orders);
      setIsLoading(false);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        filter === "Todos" ||
        order.status === filter;

      const matchesSearch =
        order.customerName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.id?.includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  const statusColors: Record<string, string> = {
    Pendente: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    Concluído: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    Cancelado: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    "Em andamento": "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    Pago: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  };

  return (
    <div className="rounded-2xl border flex flex-col justify-center items-center border-zinc-200 bg-white overflow-hidden">
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
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-6 py-3">
                  <div className="flex flex-col text-start">
                    <span className="text-xs font-semibold">
                      {order.customerName}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      #{order.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3 text-left ">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-green-500" />
                    <span className="text-zinc-500 text-xs">{order.source}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3 text-center">
                  <Badge className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-3 text-end text-xs">{order.total}</TableCell>
                <TableCell className="px-6 py-3 text-end text-xs">{order.createdAt}</TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
      <div className="flex h-6 items-center justify-center" >
        {
          isLoading && (
            <Spinner />
          )
        }
      </div>
    </div>
  )
}