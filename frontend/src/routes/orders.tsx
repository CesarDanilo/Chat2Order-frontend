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
import { useState } from 'react'

export const Route = createFileRoute('/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  const [filter, setFilter] = useState<string>('Todos');
  const [search, setSearch] = useState<string>('');


  const handleFilter = (value: string) => {
    setFilter(value);
  }

  return (
    <div className='w-screen'>
      <Header title={"Pedidos"} subtitle={"Todos os pedidos importados"} />
      <div className='px-56 py-10'>
        <div className='filters flex justify-between items-center'>
          <InputGroup className="w-[390px]">
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}

              placeholder="Buscar por cliente ou ID" />
            <InputGroupAddon >
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <Tabs defaultValue="Todos" className="w-[390px]" onValueChange={handleFilter}>
            <TabsList>
              <TabsTrigger value="Todos" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="Pendente" className="text-xs">Pendentes</TabsTrigger>
              <TabsTrigger value="Concluído" className="text-xs">Concluídos</TabsTrigger>
              <TabsTrigger value="Cancelado" className="text-xs">Cancelados</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className='text-xs cursor-pointer'>
            <CirclePlus />
            Novo pedido
          </Button>
        </div>
      </div>
      <div className='px-56'>
        <TableOrders filter={filter} search={search}/>
      </div>
    </div>
  )
}
