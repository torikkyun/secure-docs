const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("auth_token");
}

async function request<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Request failed",
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const result = await response.json();

  // Unwrap data from NestJS TransformInterceptor response format
  // Response format: { success: boolean, data: T, message?: string, timestamp: string }
  if (result && typeof result === "object" && "data" in result) {
    return result.data as T;
  }

  return result;
}

export const ApiClient = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: "POST", body });
  },

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: "PATCH", body });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "DELETE" });
  },
};
