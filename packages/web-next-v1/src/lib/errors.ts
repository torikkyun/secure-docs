/**
 * Error Handling Utilities
 * Chuẩn hóa error handling trong toàn bộ app
 */

import { ApiClientError } from "@/lib/api/base.client";

export type AppError = {
  code: string;
  message: string;
  details?: unknown;
};

/**
 * Parse error thành AppError format
 */
export function parseError(error: unknown): AppError {
  // ApiClientError
  if (error instanceof ApiClientError) {
    return {
      code: `HTTP_${error.statusCode}`,
      message: error.message,
      details: error.error,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      code: "ERROR",
      message: error.message,
      details: error.stack,
    };
  }

  // Unknown error
  return {
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
    details: error,
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const appError = parseError(error);

  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    HTTP_400: "Invalid request. Please check your input.",
    HTTP_401: "You are not authenticated. Please login.",
    HTTP_403: "You don't have permission to perform this action.",
    HTTP_404: "The requested resource was not found.",
    HTTP_409: "This resource already exists.",
    HTTP_500: "Server error. Please try again later.",
    NETWORK_ERROR: "Network error. Please check your connection.",
  };

  return errorMessages[appError.code] || appError.message;
}

/**
 * Log error for debugging
 */
export function logError(error: unknown, context?: string): void {
  const appError = parseError(error);

  console.error("[ERROR]", {
    context,
    code: appError.code,
    message: appError.message,
    details: appError.details,
    timestamp: new Date().toISOString(),
  });
}
