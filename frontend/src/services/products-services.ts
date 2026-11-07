import { readApiError } from "@/lib/api-error";

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

export type ProductPayload = Omit<Product, "id" | "createdAt" | "updatedAt">;

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
            throw await readApiError(response, "Erro ao buscar produtos");
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
            throw await readApiError(response, "Erro ao buscar produtos");
        }
        const product: Product = await response.json();
        return product;
    }

    async create(data: ProductPayload): Promise<Product> {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(this.baseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw await readApiError(response, "Erro ao criar produto");
        }
        const product: Product = await response.json();
        return product;
    }

    async update(id: string, data: Partial<ProductPayload>): Promise<Product> {
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
            throw await readApiError(response, "Erro ao atualizar produto");
        }
        const product: Product = await response.json();
        return product;
    }

    async delete(id: string) {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Usuário não autenticado");
        }

        const response = await fetch(`${this.baseURL}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw await readApiError(response, "Erro ao deletar o produto");
        }
        const product: Product = await response.json();
        return product;

    }
}
