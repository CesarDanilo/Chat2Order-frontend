import type React from "react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductService, type Product } from "@/services/products-services";

type AlertType = "success" | "error";

interface ITableProducts {
  filter: string;
  search: string;
  onDeleteProduct: (id: string) => void;
  setDrawerMode: React.Dispatch<React.SetStateAction<"create" | "edit">>;
  setSelectedProductId: React.Dispatch<React.SetStateAction<string | null>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TableProducts({
  filter,
  search,
  onDeleteProduct,
  setDrawerMode,
  setSelectedProductId,
  setOpen,
}: ITableProducts) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ show: boolean; type: AlertType; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  // Busca os produtos ao montar o componente
  useEffect(() => {
    async function fetchProducts() {
      try {
        const service = new ProductService();
        const data = await service.read();
        setProducts(data);
      } catch (error: any) {
        setAlert({ show: true, type: "error", message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Esconde o alerta após 3s
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // filter: "Todos" | "Ativo" | "Inativo"
      const matchesFilter =
        filter === "Todos" ||
        (filter === "Ativo" && product.available) ||
        (filter === "Inativo" && !product.available);

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.id?.includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [products, filter, search]);

  async function handleDelete(id: string) {
    try {
      onDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
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

  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateStr));
  }

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
              {alert.type === "success" ? "Sucesso!" : "Erro"}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-3 px-6 text-left text-zinc-500">Nome</TableHead>
            <TableHead className="py-3 px-6 text-left text-zinc-500">Descrição</TableHead>
            <TableHead className="py-3 px-6 text-left text-zinc-500">Categoria</TableHead>
            <TableHead className="px-6 py-3 text-center text-zinc-500">Disponível</TableHead>
            <TableHead className="px-6 py-3 text-end text-zinc-500">Preço</TableHead>
            <TableHead className="px-6 py-3 text-center text-zinc-500">Criado em</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-zinc-400">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>

                {/* Nome + ID */}
                <TableCell className="px-6 py-3">
                  <div className="flex flex-col text-start">
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-zinc-500 text-xs">#{product.id?.slice(0, 8) ?? "-"}</span>
                  </div>
                </TableCell>

                {/* Descrição */}
                <TableCell className="px-6 py-3 text-left text-sm text-zinc-600 max-w-[200px] truncate">
                  {product.description || "-"}
                </TableCell>

                {/* Categoria */}
                <TableCell className="px-6 py-3 text-left text-sm text-zinc-600">
                  {product.category}
                </TableCell>

                {/* Disponível */}
                <TableCell className="px-6 py-3 text-center">
                  <Badge
                    className={
                      product.available
                        ? "bg-green-50 text-green-700 border-green-300"
                        : "bg-red-50 text-red-700 border-red-300"
                    }
                  >
                    {product.available ? "Disponível" : "Indisponível"}
                  </Badge>
                </TableCell>

                {/* Preço */}
                <TableCell className="px-6 py-3 text-end text-sm">
                  {formatCurrency(product.price)}
                </TableCell>

                {/* Criado em */}
                <TableCell className="px-6 py-3 text-center text-xs text-zinc-500">
                  {formatDate(product.createdAt)}
                </TableCell>

                {/* Ações */}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}