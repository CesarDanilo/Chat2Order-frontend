import { useCallback, useEffect, useMemo, useState } from "react";
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
    // Telefone formatado para edição. O marcador de "não informado" fica como está, pois é válido.
    setCustomerPhone(
      order.customerPhone === UNKNOWN_PHONE
        ? UNKNOWN_PHONE
        : formatPhone(order.customerPhone),
    );
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
    loadOrder,
    clearFieldError,
    applyApiFieldErrors,
  };
}
