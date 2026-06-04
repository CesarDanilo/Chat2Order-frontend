import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/products')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/products"!</div>
}
