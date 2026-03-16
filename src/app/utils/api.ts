const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "69420", // Bypass ngrok warning page
    ...options?.headers as Record<string, string>,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const resData: ApiResponse<T> = await response.json();

  if (!response.ok || !resData.success) {
    throw new Error(resData.error || "Something went wrong");
  }

  return resData.data as T;
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: any) =>
    apiFetch<T>(endpoint, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) =>
    apiFetch<T>(endpoint, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: any) =>
    apiFetch<T>(endpoint, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: "DELETE" }),
  upload: <T>(endpoint: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiFetch<T>(endpoint, { method: "POST", body: formData });
  }
};
