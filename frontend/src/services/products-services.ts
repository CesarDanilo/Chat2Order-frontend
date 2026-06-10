export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class ProductService {
    private baseURL = `${import.meta.env.VITE_API_URL}/api/product`;

    async read(): Promise<Product[]> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(this.baseURL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();

            throw new Error(error.message || "Erro ao buscar produtos");
        }
        const product: Product[] = await response.json();
        return product;
    }

    async readById(id: string): Promise<Product> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${this.baseURL}/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();

            throw new Error(error.message || "Erro ao buscar produtos");
        }
        const product: Product = await response.json();
        return product;
    }

    async update(id: string, data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<Product> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${this.baseURL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erro ao atualizar produto");
        }
        const product: Product = await response.json();
        return product;
    }
}