import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CirclePlus, SearchIcon } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { DrawerProducts } from "@/components/DrawerProducts";
import { Button } from "@/components/ui/button";
import { ConfirmPopover } from "@/components/ui/confirm-popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteProduct,
  useProducts,
} from "@/hooks/queries/use-products";
import { formatCurrency } from "@/lib/formatters";

export const Route = createFileRoute("/_private/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [filter, setFilter] = useState<"all" | "available" | "unavailable">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "available" && product.available) ||
        (filter === "unavailable" && !product.available);
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.id?.includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [products, filter, search]);

  function handleCreate() {
    setDrawerMode("create");
    setSelectedProductId(null);
    setOpen(true);
  }

  function handleEdit(id: string) {
    setDrawerMode("edit");
    setSelectedProductId(id);
    setOpen(true);
  }

  return (
    <div className="flex min-h-full flex-col">
      <DrawerProducts
        open={open}
        onOpenChange={setOpen}
        mode={drawerMode}
        productId={selectedProductId}
        onSuccess={() => refetch()}
      />

      <Topbar
        title="Produtos"
        subtitle="Catálogo usado na montagem de pedidos"
        actions={
          <Button size="sm" className="h-7 gap-1.5 px-2 text-xs" onClick={handleCreate}>
            <CirclePlus className="size-3.5" />
            Novo produto
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="h-8 w-full lg:max-w-xs">
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou categoria"
              className="text-xs"
            />
            <InputGroupAddon>
              <SearchIcon className="size-3.5" />
            </InputGroupAddon>
          </InputGroup>

          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
          >
            <TabsList className="h-8">
              <TabsTrigger value="all" className="px-2 text-xs">
                Todos
              </TabsTrigger>
              <TabsTrigger value="available" className="px-2 text-xs">
                Disponível
              </TabsTrigger>
              <TabsTrigger value="unavailable" className="px-2 text-xs">
                Indisponível
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border bg-card">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm">Erro ao carregar produtos</p>
              <Button size="sm" className="mt-3 h-8 text-xs" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 px-3 text-[10px] uppercase text-muted-foreground">
                    Nome
                  </TableHead>
                  <TableHead className="h-8 px-3 text-[10px] uppercase text-muted-foreground">
                    Categoria
                  </TableHead>
                  <TableHead className="h-8 px-3 text-center text-[10px] uppercase text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-8 px-3 text-end text-[10px] uppercase text-muted-foreground">
                    Preço
                  </TableHead>
                  <TableHead className="h-8 w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="px-3 py-2">
                        <div>
                          <p className="text-xs font-medium">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground tabular-nums">
                            #{product.id?.slice(0, 8)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                        {product.category}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center">
                        <Badge
                          variant="outline"
                          className={`rounded px-1.5 py-0 text-[10px] ${
                            product.available
                              ? "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-fg)]"
                              : "border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-fg)]"
                          }`}
                        >
                          {product.available ? "Disponível" : "Indisponível"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-end text-xs tabular-nums">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-end">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => product.id && handleEdit(product.id)}
                          >
                            Editar
                          </Button>
                          <ConfirmPopover
                            title="Excluir produto?"
                            description="Esta ação não pode ser desfeita."
                            confirmLabel="Excluir"
                            onConfirm={async () => {
                              if (product.id) deleteProduct.mutate(product.id);
                            }}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              >
                                Excluir
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
