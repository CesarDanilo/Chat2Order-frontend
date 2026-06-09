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
}