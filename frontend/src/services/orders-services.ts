interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
  status: "PENDENTE" | "CONCLUIDO" | "CANCELADO";
  total: number;
  source: "WHATSAPP" | "SITE";
  rawMessage: string;
  items: OrderItem[];
}


type CreateOrderDTO = Omit<Order, "status">;

export class OrderService {
  private baseURL = "http://127.0.0.1:3000/api/order";

  async create(data: CreateOrderDTO): Promise<Order>{
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NWMzNDEzNi05ZmNkLTQyYjYtYWE4ZS03NzFkZjdhMGZmZDkiLCJpYXQiOjE3Nzk0MDExMDMsImV4cCI6MTc3OTQ4NzUwM30.LV0Qn-BsrAqksaZZmOuHQ1ke-MtGkQVH1L_vlYll804";

    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar pedido");
    }
    const order: Order = await response.json();

    return order;
  }
}