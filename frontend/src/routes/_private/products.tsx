import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CirclePlus, SearchIcon } from 'lucide-react'

import { Header } from '@/components/Header'
import { TableProducts } from '@/components/TableProducts'
import { DrawerProducts } from '@/components/DrawerProducts'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_private/products')({
  component: RouteComponent,
})

function RouteComponent() {
  const [filter, setFilter] = useState<string>('Todos')
  const [search, setSearch] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const handleCreate = () => {
    setDrawerMode('create')
    setSelectedProductId(null)
    setOpen(true)
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-zinc-50">
      <DrawerProducts
        open={open}
        onOpenChange={setOpen}
        mode={drawerMode}
        productId={selectedProductId}
      />

      <Header title="Produtos" subtitle="Todos os produtos cadastrados" />

      <div className="w-10/12 px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="w-full lg:max-w-sm">
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou ID"
            />
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>

          <Tabs defaultValue="Todos" onValueChange={setFilter}>
            <TabsList className="w-full lg:w-auto">
              <TabsTrigger value="Todos" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="ativo" className="text-xs">Ativos</TabsTrigger>
              <TabsTrigger value="rascunho" className="text-xs">Rascunhos</TabsTrigger>
              <TabsTrigger value="arquivado" className="text-xs">Arquivados</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className="gap-2 rounded-xl" onClick={handleCreate}>
            <CirclePlus size={14} />
            <span className="text-xs">Novo produto</span>
          </Button>
        </div>

        <div className="mt-8 w-full overflow-x-auto">
          <TableProducts
            filter={filter}
            search={search}
            products={[]}
            isLoading={false}
            onDeleteProduct={() => {}}
            setDrawerMode={setDrawerMode}
            setSelectedProductId={setSelectedProductId}
            setOpen={setOpen}
          />
        </div>
      </div>
    </div>
  )
}