/**
 * Base API Client - Xử lý tất cả HTTP requests
 * Single source of truth cho API configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
};

export type ApiError = {
  message: string;
  statusCode: number;
  error?: string;
};

export class ApiClientError extends Error {
  statusCode: number;
  error?: string;

  constructor(statusCode: number, message: string, error?: string) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
};

/**
 * Get auth token từ localStorage
 */
function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("auth_token");
}

/**
 * Core request function với error handling
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = options.token ?? getToken();
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Parse response
    const result = await response.json().catch(() => ({
      message: "Invalid JSON response",
    }));

    // Handle errors
    if (!response.ok) {
      throw new ApiClientError(
        response.status,
        result.message || `HTTP ${response.status}`,
        result.error
      );
    }

    // Unwrap NestJS TransformInterceptor response
    // Format: { success: boolean, data: T, message?: string, timestamp: string }
    if (result && typeof result === "object" && "data" in result) {
      return result.data as T;
    }

    return result as T;
  } catch (error) {
    // Re-throw ApiClientError
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network or other errors
    throw new ApiClientError(
      0,
      error instanceof Error ? error.message : "Network error"
    );
  }
}

/**
 * Base API Client - Export các HTTP methods
 */
export const baseApiClient = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },

  delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },

  /**
   * Helper để build query string
   */
  buildQuery(
    params: Record<string, string | number | boolean | undefined>
  ): string {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    }

    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
  },
};
