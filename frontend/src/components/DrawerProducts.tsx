import { useState } from "react";
import { ErrorState } from "@/components/feedback/states";
import { FieldError, FieldHint } from "@/components/form/field-error";
import { DrawerPanelHeader } from "@/components/layout/DrawerPanelHeader";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useSaveProduct } from "@/hooks/queries/use-products";
import { isUnauthorizedError } from "@/lib/api";
import { getApiFieldErrors, getGenericErrorMessage } from "@/lib/api-error";
import { focusDrawerField } from "@/lib/focus";
import { formatCurrency } from "@/lib/formatters";
import { LIMITS, productFormSchema, zodFieldErrors } from "@/lib/validation";
import type { Product } from "@/services/products-services";
import { toast } from "sonner";

// Campos mostrados junto ao input. Erros de outros campos vão para o toast.
const PRODUCT_FIELDS = ["name", "category", "description", "price"];

interface DrawerProductsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  productId: string | null;
}

type FormState = {
  name: string;
  category: string;
  description: string;
  price: number;
  available: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  category: "",
  description: "",
  price: 0,
  available: true,
};

const errorId = (field: string) => `product-${field}-error`;

// O conteúdo é desmontado ao fechar: cada abertura começa com o formulário limpo.
export function DrawerProducts({ open, onOpenChange, mode, productId }: DrawerProductsProps) {
  const close = () => onOpenChange(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-dvh" onOpenAutoFocus={focusDrawerField}>
        <DrawerPanelHeader
          title={mode === "create" ? "Novo produto" : "Editar produto"}
          description={
            mode === "create"
              ? "Cadastre um produto do catálogo."
              : "Atualize as informações do produto."
          }
        />
        {mode === "create" ? (
          <ProductForm productId={null} onDone={close} />
        ) : productId ? (
          <EditProduct productId={productId} onDone={close} />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function EditProduct({ productId, onDone }: { productId: string; onDone: () => void }) {
  const { data, isError, isFetchedAfterMount, isFetching, refetch } = useProduct(productId);

  if (isError && !data) {
    return (
      <ErrorState
        title="Não foi possível carregar o produto"
        onRetry={() => refetch()}
        retrying={isFetching}
        className="flex-1"
      />
    );
  }

  if (!data || !isFetchedAfterMount) {
    return (
      <div className="flex-1 space-y-5 p-5" aria-busy="true" aria-label="Carregando produto">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-9 w-1/2" />
      </div>
    );
  }

  return <ProductForm key={productId} productId={productId} initial={data} onDone={onDone} />;
}

function ProductForm({
  productId,
  initial,
  onDone,
}: {
  productId: string | null;
  initial?: Product;
  onDone: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          name: initial.name,
          category: initial.category,
          description: initial.description,
          price: initial.price,
          available: initial.available,
        }
      : EMPTY_FORM,
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const saveProduct = useSaveProduct();

  function handleChange(field: keyof FormState, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Envia só name, category, description, price e available (o schema devolve só esses campos).
    const result = productFormSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      await saveProduct.mutateAsync({ id: productId, data: result.data });
      onDone();
    } catch (err: unknown) {
      setFieldErrors(getApiFieldErrors(err));
      // Erros de campo ficam junto ao input; o toast só mostra o que não coube em um campo.
      const message = getGenericErrorMessage(err, "Erro ao salvar produto.", PRODUCT_FIELDS);
      if (message && !isUnauthorizedError(err)) toast.error(message);
    }
  }

  const describe = (field: string) =>
    fieldErrors[field] ? { "aria-invalid": true, "aria-describedby": errorId(field) } : {};

  const saving = saveProduct.isPending;

  return (
    <form noValidate onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section aria-labelledby="product-info" className="space-y-4">
          <h3 id="product-info" className="text-sm font-semibold">
            Informações do produto
          </h3>

          <div className="space-y-1.5">
            <Label htmlFor="product-name">Nome</Label>
            <Input
              id="product-name"
              data-autofocus=""
              placeholder="Ex. Camiseta Básica"
              maxLength={LIMITS.productName.max}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              {...describe("name")}
            />
            <FieldError id={errorId("name")} message={fieldErrors.name} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-category">Categoria</Label>
              <Input
                id="product-category"
                placeholder="Ex. Vestuário"
                maxLength={LIMITS.category.max}
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                {...describe("category")}
              />
              <FieldError id={errorId("category")} message={fieldErrors.category} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-available">Disponibilidade</Label>
              <Select
                value={form.available ? "ATIVO" : "ARQUIVADO"}
                onValueChange={(v) => handleChange("available", v === "ATIVO")}
              >
                <SelectTrigger id="product-available" className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">Disponível</SelectItem>
                  <SelectItem value="ARQUIVADO">Indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-description">Descrição (opcional)</Label>
            <Textarea
              id="product-description"
              placeholder="Descreva o produto..."
              maxLength={LIMITS.description.max}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-24"
              {...describe("description")}
            />
            <FieldError id={errorId("description")} message={fieldErrors.description} />
          </div>
        </section>

        <section aria-labelledby="product-pricing" className="space-y-4 border-t pt-6">
          <h3 id="product-pricing" className="text-sm font-semibold">
            Preço
          </h3>
          <div className="space-y-1.5 sm:max-w-56">
            <Label htmlFor="product-price">Preço unitário (R$)</Label>
            <Input
              id="product-price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => handleChange("price", Number(e.target.value))}
              className="tabular-nums"
              {...describe("price")}
            />
            {fieldErrors.price ? (
              <FieldError id={errorId("price")} message={fieldErrors.price} />
            ) : (
              <FieldHint>Exibido como {formatCurrency(form.price)}</FieldHint>
            )}
          </div>
        </section>
      </div>

      <DrawerFooter className="shrink-0 flex-col-reverse gap-2 border-t bg-background px-5 py-4 sm:flex-row sm:justify-end">
        <DrawerClose asChild>
          <Button type="button" variant="outline" className="h-10 sm:w-32" disabled={saving}>
            Cancelar
          </Button>
        </DrawerClose>
        <Button type="submit" className="h-10 sm:min-w-40" disabled={saving}>
          {saving ? "Salvando..." : productId ? "Salvar alterações" : "Salvar produto"}
        </Button>
      </DrawerFooter>
    </form>
  );
}
