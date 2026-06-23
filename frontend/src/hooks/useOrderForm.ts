import { useCallback, useEffect, useMemo, useState } from "react";
import z from "zod";
import type { Product } from "@/services/products-services";
import type { Order } from "@/services/orders-services";

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

const itemSchema = z.object({
  productName: z.string().min(1, "O nome do produto é obrigatório"),
  quantity: z
    .number()
    .int("A quantidade deve ser um número inteiro")
    .positive("A quantidade deve ser maior que 0"),
  unitPrice: z.number().nonnegative("O preço unitário não pode ser negativo"),
  totalPrice: z.number().nonnegative("O total do item não pode ser negativo"),
});

export const orderSchema = z.object({
  customerName: z.string().min(1, "O nome do cliente é obrigatório"),
  customerPhone: z.string().min(8, "Telefone inválido"),
  address: z.string().min(1, "O endereço é obrigatório"),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH"]),
  total: z.number().nonnegative("O total não pode ser negativo"),
  source: z.enum(["WHATSAPP", "SITE"]),
  rawMessage: z.string().optional(),
  status: z.enum(["PENDENTE", "CONCLUIDO", "CANCELADO"]),
  items: z.array(itemSchema).min(1, "O pedido deve conter pelo menos 1 item"),
});

export type OrderFormData = z.infer<typeof orderSchema>;

const EMPTY_ITEM: OrderItem = {
  productName: "",
  quantity: 1,
  unitPrice: 0,
};

function sanitizeItems(items: OrderItem[]): OrderItem[] {
  return items.filter(
    (item) =>
      item.productName.trim() !== "" ||
      item.unitPrice > 0 ||
      item.quantity !== 1,
  );
}

function mapZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) errors[path] = issue.message;
  }
  return errors;
}

interface UseOrderFormOptions {
  initialOrder?: Order | null;
}

export function useOrderForm({ initialOrder }: UseOrderFormOptions = {}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [rawMessage, setRawMessage] = useState("");
  const [status, setStatus] = useState<"PENDENTE" | "CONCLUIDO" | "CANCELADO">(
    "PENDENTE",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH"
  >("PIX");
  const [source, setSource] = useState<"WHATSAPP" | "SITE">("WHATSAPP");
  const [items, setItems] = useState<OrderItem[]>([{ ...EMPTY_ITEM }]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearForm = useCallback(() => {
    setCustomerName("");
    setCustomerPhone("");
    setAddress("");
    setRawMessage("");
    setPaymentMethod("PIX");
    setStatus("PENDENTE");
    setSource("WHATSAPP");
    setItems([{ ...EMPTY_ITEM }]);
    setFieldErrors({});
  }, []);

  const loadOrder = useCallback((order: Order) => {
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setAddress(order.address);
    setRawMessage(order.rawMessage || "");
    setStatus(order.status);
    setPaymentMethod(order.paymentMethod);
    setSource(order.source);
    setItems(
      order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );
    setFieldErrors({});
  }, []);

  useEffect(() => {
    if (initialOrder) loadOrder(initialOrder);
  }, [initialOrder, loadOrder]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [items],
  );

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateItem = useCallback(
    (index: number, field: keyof OrderItem, value: string | number) => {
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
      setFieldErrors((prev) => {
        const key = `items.${index}.${field}`;
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const addProductFromSearch = useCallback((product: Product) => {
    setItems((prev) => {
      const cleaned = sanitizeItems(prev);
      return [
        ...cleaned,
        {
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
        },
      ];
    });
  }, []);

  const buildPayload = useCallback((): OrderFormData => {
    const effectiveItems = sanitizeItems(items);
    const normalizedItems =
      effectiveItems.length > 0 ? effectiveItems : items;

    return {
      customerName,
      customerPhone,
      address,
      paymentMethod,
      total,
      source,
      rawMessage,
      status,
      items: normalizedItems.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      })),
    };
  }, [
    items,
    customerName,
    customerPhone,
    address,
    paymentMethod,
    total,
    source,
    rawMessage,
    status,
  ]);

  const validate = useCallback((): OrderFormData | null => {
    const data = buildPayload();
    const result = orderSchema.safeParse(data);

    if (!result.success) {
      setFieldErrors(mapZodErrors(result.error));
      return null;
    }

    setFieldErrors({});
    return result.data;
  }, [buildPayload]);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return {
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    address,
    setAddress,
    rawMessage,
    setRawMessage,
    status,
    setStatus,
    paymentMethod,
    setPaymentMethod,
    source,
    setSource,
    items,
    total,
    fieldErrors,
    addItem,
    removeItem,
    updateItem,
    addProductFromSearch,
    buildPayload,
    validate,
    clearForm,
    loadOrder,
    clearFieldError,
  };
}
