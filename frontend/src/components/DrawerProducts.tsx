import { useEffect, useState } from "react";
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

interface DrawerProductsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  productId: string | null;
}

export function DrawerProducts({
  open,
  onOpenChange,
  mode,
  productId,
}: DrawerProductsProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState<"ATIVO" | "RASCUNHO" | "ARQUIVADO">("ATIVO");

  useEffect(() => {
    if (open && mode === "create") clearForm();
  }, [open, mode]);

  function clearForm() {
    setName("");
    setCategory("");
    setDescription("");
    setPrice(0);
    setStock(0);
    setStatus("ATIVO");
  }

  function handleSave() {
    // TODO: integrar com ProductService
    onOpenChange(false);
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
          <div className="space-y-6">
            <Card>
              <h3 className="px-5 pt-5 text-lg font-semibold">Informações do produto</h3>
              <CardContent className="space-y-4 px-5 pb-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome</Label>
                  <Input
                    placeholder="Ex. Camiseta Básica"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Categoria</Label>
                    <Input
                      placeholder="Ex. Vestuário"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as "ATIVO" | "RASCUNHO" | "ARQUIVADO")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVO">Ativo</SelectItem>
                        <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                        <SelectItem value="ARQUIVADO">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    placeholder="Descreva o produto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estoque</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <span className="text-lg font-semibold">Valor unitário</span>
                <span className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price)}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        <DrawerFooter className="border-t">
          <Button className="w-full" onClick={handleSave}>
            {mode === "create" ? "Salvar Produto" : "Salvar Alterações"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}