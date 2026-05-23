import { useEffect, useState } from "react"


import { OrderService, type Order } from "@/services/orders-services"
import { DrawerOrders } from "@/components/DrawerOrders"
import { TableOrders } from "@/components/TableOrders"

export function OrdersPage() {

  const [orders, setOrders] = useState<Order[]>([])
  const [open, setOpen] = useState(false)

  const orderService = new OrderService()

  async function loadOrders() {
    const data = await orderService.read()

    setOrders(data)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  return (
    <>
      <DrawerOrders
        open={open}
        onOpenChange={setOpen}
        refreshOrders={loadOrders}
      />

      <TableOrders
        orders={orders}
      />
    </>
  )
}