import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import logo from "../public/icon.png";
import { ProductService } from "@/services/products-services";
import { productKeys } from "@/lib/query-client";
import { formatCurrency } from "@/lib/formatters";

interface DrawerProductsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  productId: string | null;
  onSuccess?: () => void;
}

const EMPTY_FORM = {
  name: "",
  category: "",
  description: "",
  price: 0,
  available: true,
};

export function DrawerProducts({
  open,
  onOpenChange,
  mode,
  productId,
  onSuccess,
}: DrawerProductsProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new ProductService();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setForm(EMPTY_FORM);
      setError(null);
      return;
    }

    if (mode === "edit" && productId) {
      fetchProduct(productId);
    }
  }, [open, mode, productId]);

  async function fetchProduct(id: string) {
    setLoading(true);
    setError(null);
    try {
      const product = await service.readById(id);
      setForm({
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        available: product.available,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof typeof EMPTY_FORM, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      if (mode === "create") {
        await service.create(form);
        toast.success("Produto criado com sucesso.");
      } else if (mode === "edit" && productId) {
        await service.update(productId, form);
        toast.success("Produto atualizado com sucesso.");
      }
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar produto.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="ml-auto h-screen max-w-2xl">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex justify-start items-center gap-3 px-2 py-2">
            <div className="w-6">
              <img src={logo} alt="logo" />
            </div>
            {mode === "create" ? (
              <div>
                Novo Produto
                <DrawerDescription className="text-xs">
                  Cadastre manualmente um novo produto.
                </DrawerDescription>
              </div>
            ) : (
              <div>
                Editar Produto
                <DrawerDescription className="text-xs">
                  Edite as informações do produto.
                </DrawerDescription>
              </div>
            )}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <Card>
              <h3 className="px-5 pt-5 text-lg font-semibold">Informações do produto</h3>
              <CardContent className="space-y-4 px-5 pb-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome</Label>
                  <Input
                    placeholder="Ex. Camiseta Básica"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Categoria</Label>
                    <Input
                      placeholder="Ex. Vestuário"
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={form.available ? "ATIVO" : "ARQUIVADO"}
                      onValueChange={(v) => handleChange("available", v === "ATIVO")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVO">Ativo</SelectItem>
                        <SelectItem value="ARQUIVADO">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    placeholder="Descreva o produto..."
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preço (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => handleChange("price", Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <span className="text-lg font-semibold">Valor unitário</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatCurrency(form.price)}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        <DrawerFooter className="border-t">
          <Button className="w-full" onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : mode === "create" ? "Salvar Produto" : "Salvar Alterações"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}