import { Header } from '@/components/Header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='w-screen'>
      <Header title={"Usuários"} subtitle={"Gerencie quem tem acesso à plataforma"}/>
    </div>
  )
}
