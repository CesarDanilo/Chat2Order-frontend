import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/feedback/states";
import { FieldError } from "@/components/form/field-error";
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
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import { useOrderForm } from "@/hooks/useOrderForm";
import { useCreateOrder, useOrder, useUpdateOrder } from "@/hooks/queries/use-orders";
import { useProducts } from "@/hooks/queries/use-products";
import { ProductCombobox } from "@/features/products/ProductCombobox";
import { formatCurrency } from "@/lib/formatters";
import { getApiFieldErrors } from "@/lib/api-error";
import { focusDrawerField } from "@/lib/focus";
import {
  LIMITS,
  isOrderStatusTransitionAllowed,
  type OrderStatusValue,
} from "@/lib/validation";
import type { Order } from "@/services/orders-services";

interface OrderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  orderId: string | null;
}

const STATUS_OPTIONS: { value: OrderStatusValue; label: string }[] = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
];

const errorId = (field: string) => `${field.replace(/\./g, "-")}-error`;

// O conteúdo do painel é desmontado ao fechar: cada abertura começa com um formulário novo.
export function OrderDrawer({ open, onOpenChange, mode, orderId }: OrderDrawerProps) {
  const close = () => onOpenChange(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-dvh" onOpenAutoFocus={focusDrawerField}>
        <DrawerPanelHeader
          title={mode === "create" ? "Novo pedido" : "Editar pedido"}
          description={
            mode === "create"
              ? "Monte o pedido recebido pelo WhatsApp."
              : "Atualize os dados do pedido."
          }
        />
        {mode === "create" ? (
          <OrderForm mode="create" onDone={close} />
        ) : orderId ? (
          <EditOrder orderId={orderId} onDone={close} />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function EditOrder({ orderId, onDone }: { orderId: string; onDone: () => void }) {
  const { data, isError, isFetchedAfterMount, refetch, isFetching } = useOrder(orderId, true);

  if (isError && !data) {
    return (
      <ErrorState
        title="Não foi possível carregar o pedido"
        onRetry={() => refetch()}
        retrying={isFetching}
        className="flex-1"
      />
    );
  }

  // Espera a leitura feita nesta abertura, para não editar uma cópia antiga do cache.
  if (!data || !isFetchedAfterMount) return <FormSkeleton />;

  return (
    <OrderForm
      key={orderId}
      mode="edit"
      orderId={orderId}
      initialOrder={data}
      currentStatus={data.status}
      onDone={onDone}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="flex-1 space-y-5 p-5" aria-busy="true" aria-label="Carregando pedido">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-9 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}

interface OrderFormProps {
  mode: "create" | "edit";
  orderId?: string;
  initialOrder?: Order;
  // Status gravado no servidor (edição): limita as transições oferecidas.
  currentStatus?: OrderStatusValue;
  onDone: () => void;
}

function OrderForm({ mode, orderId, initialOrder, currentStatus, onDone }: OrderFormProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: products = [] } = useProducts();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const form = useOrderForm({ initialOrder });
  const errors = form.fieldErrors;

  useKeyboardShortcut("/", () => setSearchOpen(true), { preventDefault: true });

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const data = form.validate();
    if (!data) return;

    setSubmitting(true);
    try {
      if (mode === "create") {
        await createOrder.mutateAsync({ ...data, rawMessage: data.rawMessage ?? "" });
        onDone();
      } else if (orderId) {
        await updateOrder.mutateAsync({
          id: orderId,
          data: { ...data, rawMessage: data.rawMessage ?? "" },
        });
        onDone();
      }
    } catch (err) {
      // O toast com a mensagem da API sai da mutation; aqui só os erros por campo.
      form.applyApiFieldErrors(getApiFieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = submitting || createOrder.isPending || updateOrder.isPending;

  // Edição: só o status atual e as transições permitidas. Criação: CANCELADO não é oferecido.
  const statusOptions = STATUS_OPTIONS.filter(
    (option) => mode === "edit" || option.value !== "CANCELADO",
  );

  // Liga o campo à mensagem de erro (lida pelo leitor de tela junto com o rótulo).
  const describe = (field: string) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": errorId(field) } : {};

  return (
    <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section aria-labelledby="order-customer" className="space-y-4">
          <h3 id="order-customer" className="text-sm font-semibold">
            Cliente
          </h3>
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Nome</Label>
            <Input
              id="customerName"
              data-autofocus={mode === "create" ? "" : undefined}
              placeholder="Ex. João Silva"
              autoComplete="off"
              maxLength={LIMITS.customerName.max}
              value={form.customerName}
              onChange={(e) => {
                form.setCustomerName(e.target.value);
                form.clearFieldError("customerName");
              }}
              {...describe("customerName")}
            />
            <FieldError id={errorId("customerName")} message={errors.customerName} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Telefone</Label>
              <Input
                id="customerPhone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="(11) 91234-5678"
                maxLength={LIMITS.phone.max}
                value={form.customerPhone}
                onChange={(e) => {
                  form.setCustomerPhone(e.target.value);
                  form.clearFieldError("customerPhone");
                }}
                className="tabular-nums"
                {...describe("customerPhone")}
              />
              <FieldError id={errorId("customerPhone")} message={errors.customerPhone} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-source">Origem</Label>
              <Select
                value={form.source}
                onValueChange={(v) => form.setSource(v as "WHATSAPP" | "SITE")}
              >
                <SelectTrigger id="order-source" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="SITE">Site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Endereço de entrega</Label>
            <Textarea
              id="address"
              placeholder="Rua, número, bairro, cidade"
              maxLength={LIMITS.address.max}
              value={form.address}
              onChange={(e) => {
                form.setAddress(e.target.value);
                form.clearFieldError("address");
              }}
              className="min-h-20"
              {...describe("address")}
            />
            <FieldError id={errorId("address")} message={errors.address} />
          </div>
        </section>

        <section aria-labelledby="order-payment" className="space-y-4 border-t pt-6">
          <h3 id="order-payment" className="text-sm font-semibold">
            Pagamento e status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="order-payment-method">Pagamento</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(v) =>
                  form.setPaymentMethod(v as "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH")
                }
              >
                <SelectTrigger id="order-payment-method" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="CREDIT_CARD">Cartão de crédito</SelectItem>
                  <SelectItem value="DEBIT_CARD">Cartão de débito</SelectItem>
                  <SelectItem value="CASH">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => form.setStatus(v as OrderStatusValue)}
              >
                <SelectTrigger id="order-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={
                        currentStatus !== undefined &&
                        !isOrderStatusTransitionAllowed(currentStatus, option.value)
                      }
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section aria-labelledby="order-items" className="space-y-3 border-t pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="order-items" className="text-sm font-semibold">
              Itens
            </h3>
            <div className="flex gap-2">
              <ProductCombobox
                products={products}
                open={searchOpen}
                onOpenChange={setSearchOpen}
                onSelect={form.addProductFromSearch}
                disabled={isBusy}
              />
              <Button type="button" size="sm" variant="outline" onClick={form.addItem}>
                <Plus className="size-4" aria-hidden="true" />
                Item manual
              </Button>
            </div>
          </div>
          <FieldError id={errorId("items")} message={errors.items} />

          <div
            aria-hidden="true"
            className="hidden grid-cols-12 gap-2 px-2.5 text-xs font-medium text-muted-foreground sm:grid"
          >
            <span className="col-span-6">Produto</span>
            <span className="col-span-2">Qtd.</span>
            <span className="col-span-3">Preço unit. (R$)</span>
          </div>

          <div className="space-y-2">
            {form.items.map((item, index) => {
              const n = index + 1;
              const nameKey = `items.${index}.productName`;
              const qtyKey = `items.${index}.quantity`;
              const priceKey = `items.${index}.unitPrice`;
              return (
                <div
                  key={index}
                  className="grid grid-cols-12 items-start gap-2 rounded-lg border bg-muted/40 p-2.5"
                >
                  <div className="col-span-12 space-y-1 sm:col-span-6">
                    <Label htmlFor={`item-${index}-name`} className="text-xs text-muted-foreground sm:sr-only">
                      Produto do item {n}
                    </Label>
                    <Input
                      id={`item-${index}-name`}
                      placeholder="Produto"
                      maxLength={LIMITS.itemName.max}
                      value={item.productName}
                      onChange={(e) => form.updateItem(index, "productName", e.target.value)}
                      className="bg-card"
                      {...describe(nameKey)}
                    />
                    <FieldError id={errorId(nameKey)} message={errors[nameKey]} />
                  </div>
                  <div className="col-span-4 space-y-1 sm:col-span-2">
                    <Label htmlFor={`item-${index}-qty`} className="text-xs text-muted-foreground sm:sr-only">
                      Quantidade
                    </Label>
                    <Input
                      id={`item-${index}-qty`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => form.updateItem(index, "quantity", Number(e.target.value))}
                      className="bg-card tabular-nums"
                      {...describe(qtyKey)}
                    />
                    <FieldError id={errorId(qtyKey)} message={errors[qtyKey]} />
                  </div>
                  <div className="col-span-6 space-y-1 sm:col-span-3">
                    <Label htmlFor={`item-${index}-price`} className="text-xs text-muted-foreground sm:sr-only">
                      Preço unitário (R$)
                    </Label>
                    <Input
                      id={`item-${index}-price`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => form.updateItem(index, "unitPrice", Number(e.target.value))}
                      className="bg-card tabular-nums"
                      {...describe(priceKey)}
                    />
                    <FieldError id={errorId(priceKey)} message={errors[priceKey]} />
                  </div>
                  <div className="col-span-2 flex justify-end self-end sm:col-span-1 sm:self-start">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => form.removeItem(index)}
                      disabled={form.items.length <= 1}
                      aria-label={`Remover item ${n}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-1.5 border-t pt-6">
          <Label htmlFor="rawMessage">Conversa importada (opcional)</Label>
          <Textarea
            id="rawMessage"
            placeholder="Cole aqui a conversa do cliente..."
            maxLength={LIMITS.rawMessage.max}
            value={form.rawMessage}
            onChange={(e) => {
              form.setRawMessage(e.target.value);
              form.clearFieldError("rawMessage");
            }}
            className="min-h-24"
            {...describe("rawMessage")}
          />
          <FieldError id={errorId("rawMessage")} message={errors.rawMessage} />
        </section>
      </div>

      <DrawerFooter className="shrink-0 gap-3 border-t bg-background px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total do pedido</span>
          <span className="text-xl font-semibold tabular-nums" aria-live="polite">
            {formatCurrency(form.total)}
          </span>
        </div>
        <FieldError id={errorId("total")} message={errors.total} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button type="button" variant="outline" className="h-10 sm:w-32">
              Cancelar
            </Button>
          </DrawerClose>
          <Button type="submit" className="h-10 sm:min-w-40" disabled={isBusy}>
            {isBusy ? "Salvando..." : mode === "create" ? "Salvar pedido" : "Salvar alterações"}
          </Button>
        </div>
        <p className="hidden text-center text-xs text-muted-foreground sm:block">
          <kbd className="rounded border bg-muted px-1 font-sans">Esc</kbd> fecha ·{" "}
          <kbd className="rounded border bg-muted px-1 font-sans">/</kbd> busca produto
        </p>
      </DrawerFooter>
    </form>
  );
}
