import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState, useEffect } from "react";
import type { Product } from "@/services/products-services";
import { Skeleton } from "./ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AlertType = "success" | "error";

interface ITableProducts {
  products: Product[];
  filter: string;
  search: string;
  isLoading: boolean;
  onDeleteProduct: (id: string) => void;
  setDrawerMode: React.Dispatch<React.SetStateAction<"create" | "edit">>;
  setSelectedProductId: React.Dispatch<React.SetStateAction<string | null>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MOCK_PRODUCTS: Product[] = [
  { id: "prd-00000001", name: 'MacBook Pro 16"', category: "Notebooks", price: 24990, stock: 12, status: "ATIVO" },
  { id: "prd-00000002", name: "iPhone 15 Pro", category: "Smartphones", price: 9990, stock: 34, status: "ATIVO" },
  { id: "prd-00000003", name: "iPad Air M2", category: "Tablets", price: 7999, stock: 0, status: "ARQUIVADO" },
  { id: "prd-00000004", name: "AirPods Pro", category: "Acessórios", price: 1999, stock: 58, status: "ATIVO" },
  { id: "prd-00000005", name: "Apple Watch Ultra", category: "Wearables", price: 9999, stock: 7, status: "RASCUNHO" },
  { id: "prd-00000006", name: "Mac Mini M4", category: "Desktops", price: 12990, stock: 5, status: "ATIVO" },
  { id: "prd-00000007", name: "HomePod 2ª geração", category: "Áudio", price: 3999, stock: 20, status: "RASCUNHO" },
];

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-300",
  RASCUNHO: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
  ARQUIVADO: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-300",
};

const statusLabel: Record<string, string> = {
  ATIVO: "Ativo",
  RASCUNHO: "Rascunho",
  ARQUIVADO: "Arquivado",
};

export function TableProducts({
  filter,
  search,
  products,
  isLoading,
  onDeleteProduct,
  setDrawerMode,
  setSelectedProductId,
  setOpen,
}: ITableProducts) {
  const [alert, setAlert] = useState<{ show: boolean; type: AlertType; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const source = products.length > 0 ? products : MOCK_PRODUCTS;

  const filteredProducts = useMemo(() => {
    return source.filter((product) => {
      const matchesFilter = filter === "Todos" || product.status === filter.toUpperCase();
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.id?.includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [source, filter, search]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  async function handleDelete(id: string) {
    try {
      onDeleteProduct(id);
      setAlert({ show: true, type: "success", message: "Produto deletado com sucesso." });
    } catch {
      setAlert({ show: true, type: "error", message: "Não foi possível deletar o produto." });
    }
  }

  function handleEdit(id: string) {
    setDrawerMode("edit");
    setSelectedProductId(id);
    setOpen(true);
  }

  function formatCurrency(value?: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
  }

  return (
    <div className="rounded-2xl border flex flex-col border-zinc-200 bg-white overflow-hidden">
      {alert.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5">
          <Alert
            className={`w-[350px] shadow-lg border ${
              alert.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            }`}
          >
            <AlertTitle>
              {alert.type === "success" ? "Produto deletado!" : "Erro ao deletar produto"}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-3 px-6 text-left text-zinc-500">Nome</TableHead>
            <TableHead className="py-3 px-6 text-left text-zinc-500">Categoria</TableHead>
            <TableHead className="px-6 py-3 text-center text-zinc-500">Status</TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">Estoque</TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">Preço</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="px-6 py-3">
                <div className="flex flex-col text-start">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-zinc-500 text-xs">#{product.id?.slice(0, 8) ?? "-"}</span>
                </div>
              </TableCell>

              <TableCell className="px-6 py-3 text-left text-sm text-zinc-600">
                {product.category}
              </TableCell>

              <TableCell className="px-6 py-3 text-center">
                <Badge className={statusColors[product.status]}>
                  {statusLabel[product.status] ?? product.status}
                </Badge>
              </TableCell>

              <TableCell className="px-6 py-3 text-end text-xs text-zinc-600">
                {product.stock ?? 0}
              </TableCell>

              <TableCell className="px-6 py-3 text-end text-xs">
                {formatCurrency(product.price)}
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">⋮</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => {
                          (document.activeElement as HTMLElement)?.blur();
                          if (product.id) handleEdit(product.id);
                        }}
                      >
                        Editar produto
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => { if (product.id) handleDelete(product.id); }}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}