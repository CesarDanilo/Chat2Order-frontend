import { Header } from '@/components/Header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='w-screen'>
      <Header title={"Pedidos"} subtitle={"Todos os pedidos importados"} />
    </div>
  )
}
