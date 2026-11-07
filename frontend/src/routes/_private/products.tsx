import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Package, Plus, SearchX } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { SearchField } from "@/components/layout/SearchField";
import { DrawerProducts } from "@/components/DrawerProducts";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { ToneBadge } from "@/components/feedback/tone-badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteProduct, useProducts } from "@/hooks/queries/use-products";
import { formatCurrency } from "@/lib/formatters";
import type { Product } from "@/services/products-services";

export const Route = createFileRoute("/_private/products")({
  component: ProductsPage,
});

type Filter = "all" | "available" | "unavailable";
type DrawerState = { open: boolean; mode: "create" | "edit"; productId: string | null };

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <ToneBadge tone={available ? "success" : "neutral"}>
      {available ? "Disponível" : "Indisponível"}
    </ToneBadge>
  );
}

function ProductActions({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => product.id && onEdit(product.id)}>
        Editar
      </Button>
      <ConfirmPopover
        title="Excluir produto?"
        description={`${product.name} sairá do catálogo. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (product.id) onDelete(product.id);
        }}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Excluir
          </Button>
        }
      />
    </div>
  );
}

function ProductsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, mode: "create", productId: null });

  const { data: products = [], isLoading, isError, isFetching, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "available" && product.available) ||
        (filter === "unavailable" && !product.available);
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        (product.id?.includes(term) ?? false);
      return matchesFilter && matchesSearch;
    });
  }, [products, filter, search]);

  const handleCreate = () => setDrawer({ open: true, mode: "create", productId: null });
  const handleEdit = (id: string) => setDrawer({ open: true, mode: "edit", productId: id });
  const handleDelete = (id: string) => deleteProduct.mutate(id);

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <div className="divide-y" aria-busy="true" aria-label="Carregando produtos">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <ErrorState
        title="Não foi possível carregar os produtos"
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  } else if (products.length === 0) {
    content = (
      <EmptyState
        icon={Package}
        title="Catálogo vazio"
        description="Cadastre os produtos para montar pedidos mais rápido."
        action={
          <Button onClick={handleCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Cadastrar produto
          </Button>
        }
      />
    );
  } else if (filteredProducts.length === 0) {
    content = (
      <EmptyState
        icon={SearchX}
        title="Nenhum produto encontrado"
        description="Ajuste a busca ou o filtro de disponibilidade."
      />
    );
  } else {
    content = (
      <>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4 text-xs text-muted-foreground">Produto</TableHead>
                <TableHead className="text-xs text-muted-foreground">Categoria</TableHead>
                <TableHead className="text-xs text-muted-foreground">Disponibilidade</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">Preço</TableHead>
                <TableHead className="pr-3">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="max-w-80 py-3 pl-4">
                    <p className="truncate font-medium">{product.name}</p>
                    {product.description ? (
                      <p className="truncate text-xs text-muted-foreground">{product.description}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {product.category || "—"}
                  </TableCell>
                  <TableCell className="py-3">
                    <AvailabilityBadge available={product.available} />
                  </TableCell>
                  <TableCell className="py-3 text-right font-medium tabular-nums">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="py-3 pr-3">
                    <ProductActions product={product} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ul className="divide-y md:hidden" aria-label="Produtos">
          {filteredProducts.map((product) => (
            <li key={product.id} className="space-y-3 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category || "Sem categoria"}</p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(product.price)}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <AvailabilityBadge available={product.available} />
                <div className="-mr-2">
                  <ProductActions product={product} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <DrawerProducts
        open={drawer.open}
        onOpenChange={(open) => setDrawer((prev) => ({ ...prev, open }))}
        mode={drawer.mode}
        productId={drawer.productId}
      />

      <Topbar
        title="Produtos"
        subtitle="Catálogo usado na montagem de pedidos"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Novo produto
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={search}
            onChange={setSearch}
            label="Buscar produtos por nome ou categoria"
            placeholder="Buscar por nome ou categoria"
          />
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as Filter)}
            aria-label="Filtrar por disponibilidade"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="px-2 sm:px-3">Todos</TabsTrigger>
              <TabsTrigger value="available" className="px-2 sm:px-3">Disponíveis</TabsTrigger>
              <TabsTrigger value="unavailable" className="px-2 sm:px-3">Indisponíveis</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg border bg-card">{content}</div>
          {!isLoading && !isError && products.length > 0 ? (
            <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
              {filteredProducts.length === products.length
                ? `${products.length} ${products.length === 1 ? "produto" : "produtos"}`
                : `${filteredProducts.length} de ${products.length} produtos`}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
