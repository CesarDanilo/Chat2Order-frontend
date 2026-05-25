import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LaptopMinimal, MessageCircle } from "lucide-react"
import { useMemo } from "react"
import type { Order } from "@/services/orders-services"
import { Skeleton } from "./ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface IFilterType {
  orders: Order[]
  filter: string
  search: string
  isLoading: boolean
}

export function TableOrders({ filter, search, orders, isLoading, }: IFilterType) {

  function formatDate(date?: string) {
    if (!date) return "-";

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date));
  }

  const statusColors: Record<string, string> = {
    PENDENTE:
      "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",

    CONCLUIDO:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",

    CANCELADO:
      "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {

      const matchesFilter =
        filter === "Todos" ||
        order.status === filter.toUpperCase()

      const matchesSearch =
        order.customerName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.id?.includes(search)

      return matchesFilter && matchesSearch
    })
  }, [orders, filter, search])

  function UpperCaseStatus(status: string) {
    return status.replace(/\b\w/g, char => char.toUpperCase());
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  function handleDelete() {}

  return (
    <div className="rounded-2xl border flex flex-col border-zinc-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-3 px-6 text-left text-zinc-500">
              Cliente
            </TableHead>
            <TableHead className="py-3 px-6 text-left text-zinc-500">
              Origem
            </TableHead>
            <TableHead className="px-6 py-3 text-center text-zinc-500">
              Status
            </TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">
              Total
            </TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">
              Data
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : (
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

                <TableCell className="px-6 py-3 text-left">
                  <div className="flex items-center gap-2">
                    {order.source === "WHATSAPP" ? (
                      <MessageCircle
                        size={16}
                        className="text-green-500"
                      />
                    ) : (
                      <LaptopMinimal
                        size={16}
                        className="text-purple-700"
                      />
                    )}

                    <span className="text-zinc-500 text-xs">
                      {UpperCaseStatus(order.source.toLowerCase())}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-3 text-center">
                  <Badge className={statusColors[order.status]}>
                    {order.status === "CONCLUIDO"
                      ? "Concluído"
                      : UpperCaseStatus(order.status.toLowerCase())}
                  </Badge>
                </TableCell>

                <TableCell className="px-6 py-3 text-end text-xs">
                  R$ {order.total.toFixed(2)}
                </TableCell>

                <TableCell className="px-6 py-3 text-end text-xs">
                  {formatDate(order.createdAt)}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                      >
                        ⋮
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuGroup>
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar pedido</DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />

                      {/* EXCLUIR */}
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleDelete(order.id)}
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}