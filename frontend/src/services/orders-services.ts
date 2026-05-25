interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
  status: "PENDENTE" | "CONCLUIDO" | "CANCELADO";
  total: number;
  source: "WHATSAPP" | "SITE";
  rawMessage: string;
  items: OrderItem[];
  createdAt?: string;
}


type CreateOrderDTO = Omit<Order, "status">;

export class OrderService {
  private baseURL = "http://127.0.0.1:3000/api/order";

  //Create order
  async create(data: CreateOrderDTO): Promise<Order>{

    const token =
      localStorage.getItem("token");

    if (!token) {
      throw new Error("Usuário não autenticado");
    }

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

  //Get order
  async read(): Promise<Order[]> {
    const token =
      localStorage.getItem("token");

    if (!token) {
      throw new Error("Usuário não autenticado");
    }
    
    const response = await fetch(this.baseURL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || "Erro ao buscar pedidos");
    }
    const order: Order[] = await response.json()
    return order;
  }
}