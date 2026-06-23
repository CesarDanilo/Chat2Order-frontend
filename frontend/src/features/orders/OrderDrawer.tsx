import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcuts";
import { useOrderForm } from "@/hooks/useOrderForm";
import { useOrder } from "@/hooks/queries/use-orders";
import { useCreateOrder, useUpdateOrder } from "@/hooks/queries/use-orders";
import { useProducts } from "@/hooks/queries/use-products";
import { ProductCombobox } from "@/features/products/ProductCombobox";
import { formatCurrency } from "@/lib/formatters";
import logo from "../../public/icon.png";

interface OrderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  orderId: string | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[10px] text-destructive">{message}</p>;
}

export function OrderDrawer({
  open,
  onOpenChange,
  mode,
  orderId,
}: OrderDrawerProps) {
  const customerNameRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: products = [] } = useProducts();
  const { data: loadedOrder, isLoading: loadingOrder } = useOrder(
    orderId,
    open && mode === "edit",
  );
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  const form = useOrderForm();

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      form.clearForm();
    }
  }, [open, mode]);

  useEffect(() => {
    if (loadedOrder && mode === "edit") {
      form.loadOrder(loadedOrder);
    }
  }, [loadedOrder, mode]);

  useEffect(() => {
    if (open && mode === "create") {
      const timer = setTimeout(() => customerNameRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open, mode]);

  useKeyboardShortcut("/", () => setSearchOpen(true), {
    enabled: open,
    preventDefault: true,
  });

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const data = form.validate();
    if (!data) return;

    setSubmitting(true);
    try {
      if (mode === "create") {
        await createOrder.mutateAsync({ ...data, rawMessage: data.rawMessage ?? "" });
        form.clearForm();
        onOpenChange(false);
      } else if (orderId) {
        await updateOrder.mutateAsync({
          id: orderId,
          data: { ...data, rawMessage: data.rawMessage ?? "" },
        });
        onOpenChange(false);
      }
    } catch {
      // toast handled in mutation
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = submitting || createOrder.isPending || updateOrder.isPending;

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="ml-auto flex h-screen max-w-xl flex-col">
        <DrawerHeader className="shrink-0 border-b px-4 py-3">
          <DrawerTitle className="flex items-center gap-2 text-sm">
            <img src={logo} alt="" className="size-5" />
            {mode === "create" ? "Novo pedido" : "Editar pedido"}
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            {mode === "create"
              ? "Monte o pedido recebido pelo WhatsApp."
              : "Atualize os dados do pedido."}
          </DrawerDescription>
        </DrawerHeader>

        {mode === "edit" && loadingOrder ? (
          <div className="flex-1 space-y-3 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cliente
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="text-xs">
                    Nome
                  </Label>
                  <Input
                    ref={customerNameRef}
                    id="customerName"
                    placeholder="Ex. João Silva"
                    value={form.customerName}
                    onChange={(e) => {
                      form.setCustomerName(e.target.value);
                      form.clearFieldError("customerName");
                    }}
                    className="h-8 text-xs"
                  />
                  <FieldError message={form.fieldErrors.customerName} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="customerPhone" className="text-xs">
                      Telefone
                    </Label>
                    <Input
                      id="customerPhone"
                      placeholder="+55 67 999999999"
                      value={form.customerPhone}
                      onChange={(e) => {
                        form.setCustomerPhone(e.target.value);
                        form.clearFieldError("customerPhone");
                      }}
                      className="h-8 text-xs tabular-nums"
                    />
                    <FieldError message={form.fieldErrors.customerPhone} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Origem</Label>
                    <Select
                      value={form.source}
                      onValueChange={(v) =>
                        form.setSource(v as "WHATSAPP" | "SITE")
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
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
                  <Label htmlFor="address" className="text-xs">
                    Endereço
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Rua, número, bairro, cidade"
                    value={form.address}
                    onChange={(e) => {
                      form.setAddress(e.target.value);
                      form.clearFieldError("address");
                    }}
                    className="min-h-16 text-xs"
                  />
                  <FieldError message={form.fieldErrors.address} />
                </div>
              </section>

              <Separator />

              <section className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Pagamento</Label>
                  <Select
                    value={form.paymentMethod}
                    onValueChange={(v) =>
                      form.setPaymentMethod(
                        v as "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH",
                      )
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="CREDIT_CARD">Cartão</SelectItem>
                      <SelectItem value="DEBIT_CARD">Débito</SelectItem>
                      <SelectItem value="CASH">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      form.setStatus(
                        v as "PENDENTE" | "CONCLUIDO" | "CANCELADO",
                      )
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <Separator />

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={form.addItem}
                    >
                      <Plus className="size-3.5" />
                      Manual
                    </Button>
                  </div>
                </div>
                <FieldError message={form.fieldErrors.items} />

                <div className="space-y-2">
                  {form.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 rounded-md border bg-muted/30 p-2"
                    >
                      <div className="col-span-5 space-y-1">
                        <Input
                          placeholder="Produto"
                          value={item.productName}
                          onChange={(e) =>
                            form.updateItem(index, "productName", e.target.value)
                          }
                          className="h-7 text-xs"
                        />
                        <FieldError
                          message={form.fieldErrors[`items.${index}.productName`]}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            form.updateItem(index, "quantity", Number(e.target.value))
                          }
                          className="h-7 text-xs tabular-nums"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            form.updateItem(index, "unitPrice", Number(e.target.value))
                          }
                          className="h-7 text-xs tabular-nums"
                        />
                      </div>
                      <div className="col-span-2 flex items-start justify-end">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => form.removeItem(index)}
                          disabled={form.items.length <= 1}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-1.5">
                <Label htmlFor="rawMessage" className="text-xs">
                  Conversa importada
                </Label>
                <Textarea
                  id="rawMessage"
                  placeholder="Cole aqui a conversa do cliente..."
                  value={form.rawMessage}
                  onChange={(e) => form.setRawMessage(e.target.value)}
                  className="min-h-24 text-xs"
                />
              </section>

              <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                <span className="text-xs font-medium">Total</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatCurrency(form.total)}
                </span>
              </div>
            </div>

            <DrawerFooter className="shrink-0 border-t p-3">
              <Button
                type="submit"
                className="h-9 w-full text-xs"
                disabled={isBusy}
              >
                {isBusy
                  ? "Salvando..."
                  : mode === "create"
                    ? "Salvar pedido"
                    : "Salvar alterações"}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="h-8 w-full text-xs">
                  Cancelar
                </Button>
              </DrawerClose>
              <p className="text-center text-[10px] text-muted-foreground">
                <kbd className="rounded border bg-muted px-1">Enter</kbd> salvar ·{" "}
                <kbd className="rounded border bg-muted px-1">Esc</kbd> fechar ·{" "}
                <kbd className="rounded border bg-muted px-1">/</kbd> buscar produto
              </p>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
