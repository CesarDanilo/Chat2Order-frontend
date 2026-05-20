import { Header } from '@/components/Header'
import { createFileRoute } from '@tanstack/react-router'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CirclePlus, SearchIcon } from 'lucide-react'
import { TableOrders } from '@/components/TableOrders'

export const Route = createFileRoute('/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='w-screen'>
      <Header title={"Pedidos"} subtitle={"Todos os pedidos importados"} />
      <div className='px-56 py-10'>
        <div className='filters flex justify-between items-center'>
          <InputGroup className="w-[390px]">
            <InputGroupInput placeholder="Buscar por cliente ou ID" />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <Tabs defaultValue="Todos" className="w-[390px]">
            <TabsList>
              <TabsTrigger value="Todos" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="Pendentes" className="text-xs">Pendentes</TabsTrigger>
              <TabsTrigger value="Concluídos" className="text-xs">Concluídos</TabsTrigger>
              <TabsTrigger value="Cancelados" className="text-xs">Cancelados</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className='text-xs cursor-pointer'>
            <CirclePlus />
            Novo pedido
          </Button>
        </div>
      </div>
      <div className='px-56'>
        <TableOrders />
      </div>
    </div>
  )
}
