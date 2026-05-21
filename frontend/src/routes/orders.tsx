import { Header } from "@/components/Header";
import { TableOrders } from "@/components/TableOrders";

import { createFileRoute } from "@tanstack/react-router";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";

import { CirclePlus, SearchIcon } from "lucide-react";

import { useState } from "react";
import { DrawerOrders } from "@/components/DrawerOrders";

export const Route = createFileRoute("/orders")({
  component: RouteComponent,
});

function RouteComponent() {
  const [filter, setFilter] = useState<string>("Todos");
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const handleFilter = (value: string) => {
    setFilter(value);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-background">
      <DrawerOrders
        open={open}
        onOpenChange={setOpen}
      />

      <Header
        title="Pedidos"
        subtitle="Todos os pedidos importados"
      />

      <div className="w-10/12 px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="w-full lg:max-w-sm">
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente ou ID"
            />
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
          </InputGroup>
          <Tabs
            defaultValue="Todos"
            onValueChange={handleFilter}
          >
            <TabsList className="w-full lg:w-auto">
              <TabsTrigger value="Todos" className="text-xs">
                Todos
              </TabsTrigger>
              <TabsTrigger value="Pendente" className="text-xs">
                Pendentes
              </TabsTrigger>
              <TabsTrigger value="Concluído" className="text-xs">
                Concluídos
              </TabsTrigger>
              <TabsTrigger value="Cancelado" className="text-xs">
                Cancelados
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button className="w-full cursor-pointer gap-2 lg:w-auto" onClick={() => handleOpen()}>
            <CirclePlus className="size-4" />
            Novo pedido
          </Button>
        </div>
        <div className="mt-8 w-full overflow-x-auto">
          <TableOrders
            filter={filter}
            search={search}
          />
        </div>
      </div>
    </div>
  );
}