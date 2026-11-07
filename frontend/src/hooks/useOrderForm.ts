import { useCallback, useMemo, useState } from "react";
import type { z } from "zod";
import type { Product } from "@/services/products-services";
import type { Order } from "@/services/orders-services";
import { UNKNOWN_PHONE, orderFormSchema } from "@/lib/validation";
import { formatPhone } from "@/lib/formatters";

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export type OrderFormData = z.infer<typeof orderFormSchema>;

// Arredonda para 2 casas decimais (evita 0.30000000000000004 no payload).
const roundMoney = (value: number) => Math.round(value * 100) / 100;

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

// Valores iniciais do formulário. Pedido existente: telefone formatado para edição
// (o marcador de "não informado" fica como está, pois é válido).
function initialValues(order?: Order | null) {
  if (!order) {
    return {
      customerName: "",
      customerPhone: "",
      address: "",
      rawMessage: "",
      status: "PENDENTE" as const,
      paymentMethod: "PIX" as const,
      source: "WHATSAPP" as const,
      items: [{ ...EMPTY_ITEM }],
    };
  }
  return {
    customerName: order.customerName,
    customerPhone:
      order.customerPhone === UNKNOWN_PHONE ? UNKNOWN_PHONE : formatPhone(order.customerPhone),
    address: order.address,
    rawMessage: order.rawMessage || "",
    status: order.status,
    paymentMethod: order.paymentMethod,
    source: order.source,
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

// O estado nasce do pedido recebido. Para carregar outro pedido, remonte o componente (key).
export function useOrderForm({ initialOrder }: UseOrderFormOptions = {}) {
  const [initial] = useState(() => initialValues(initialOrder));
  const [customerName, setCustomerName] = useState(initial.customerName);
  const [customerPhone, setCustomerPhone] = useState(initial.customerPhone);
  const [address, setAddress] = useState(initial.address);
  const [rawMessage, setRawMessage] = useState(initial.rawMessage);
  const [status, setStatus] = useState<"PENDENTE" | "CONCLUIDO" | "CANCELADO">(initial.status);
  const [paymentMethod, setPaymentMethod] = useState<
    "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH"
  >(initial.paymentMethod);
  const [source, setSource] = useState<"WHATSAPP" | "SITE">(initial.source);
  const [items, setItems] = useState<OrderItem[]>(initial.items);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearForm = useCallback(() => {
    const empty = initialValues(null);
    setCustomerName(empty.customerName);
    setCustomerPhone(empty.customerPhone);
    setAddress(empty.address);
    setRawMessage(empty.rawMessage);
    setPaymentMethod(empty.paymentMethod);
    setStatus(empty.status);
    setSource(empty.source);
    setItems(empty.items);
    setFieldErrors({});
  }, []);

  const total = useMemo(
    () =>
      roundMoney(
        items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
      ),
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
        totalPrice: roundMoney(item.quantity * item.unitPrice),
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
    const result = orderFormSchema.safeParse(data);

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

  // Erros por campo devolvidos pela API (ex.: items.0.quantity). Campos que não existem no formulário ficam fora da tela; a mensagem geral aparece no toast.
  const applyApiFieldErrors = useCallback((fields: Record<string, string>) => {
    setFieldErrors(fields);
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
    clearFieldError,
    applyApiFieldErrors,
  };
}
