import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function TableOrders() {

  const orders = [
    {
      id: 1,
      customer: "João Silva",
      origin: "WhatsApp",
      status: "Pendente",
      total: "R$ 320,00",
      date: "20/05/2026",
    },
    {
      id: 2,
      customer: "Maria Oliveira",
      origin: "Instagram",
      status: "Concluído",
      total: "R$ 1.250,00",
      date: "19/05/2026",
    },
    {
      id: 3,
      customer: "Lucas Almeida",
      origin: "Site",
      status: "Cancelado",
      total: "R$ 89,90",
      date: "18/05/2026",
    },
    {
      id: 4,
      customer: "Fernanda Costa",
      origin: "WhatsApp",
      status: "Em andamento",
      total: "R$ 540,00",
      date: "17/05/2026",
    },
    {
      id: 5,
      customer: "Rafael Martins",
      origin: "Facebook",
      status: "Pago",
      total: "R$ 2.430,00",
      date: "16/05/2026",
    },
  ];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-3 px-6 text-left text-zinc-500">Cliente</TableHead>
            <TableHead className="py-3 px-6 text-left text-zinc-500">origen</TableHead>
            <TableHead className="px-6 py-3 text-center text-zinc-500">Status</TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">Total</TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            orders.map((order, key) => (
              <TableRow key={key}>
                <TableCell className="px-6 py-3">
                  <div className="flex flex-col text-start">
                    <span className="font-medium">
                      {order.customer}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      #{order.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3 text-left">{order.origin}</TableCell>
                <TableCell className="px-6 py-3 text-center">
                  <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-3 text-end">{order.total}</TableCell>
                <TableCell className="px-6 py-3 text-end">{order.date}</TableCell>
              </TableRow>

            ))
          }
        </TableBody>
      </Table>
    </div>
  )
}