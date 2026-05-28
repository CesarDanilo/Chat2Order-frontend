const API_URL = `${import.meta.env.VITE_API_URL}/api`;

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function api(endpoint: string, options?: RequestOptions) {
  const token = localStorage.getItem("token");

  const headers = new Headers(options?.headers);

  headers.set("Content-Type", "application/json");

  if (options?.auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error("Erro na requisição");
  }

  return response.json();
}
