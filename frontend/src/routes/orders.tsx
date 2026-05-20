import { Header } from '@/components/Header'
import { createFileRoute } from '@tanstack/react-router'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon } from 'lucide-react'

export const Route = createFileRoute('/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='w-screen'>
      <Header title={"Pedidos"} subtitle={"Todos os pedidos importados"} />
      <div className='px-56 py-10'>
        <div className='filters'>
          <InputGroup className="w-[390px]">
            <InputGroupInput placeholder="Buscar por cliente ou ID" />
            <InputGroupAddon>
              <SearchIcon />  
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </div>
  )
}
