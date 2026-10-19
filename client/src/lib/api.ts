const API_BASE = "/api";

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || response.statusText || "Something went wrong";
    throw new ApiError(errorMsg, response.status, data?.details);
  }

  return data;
}

export const api = {
  get: <T = any>(url: string) => apiRequest<T>(url, { method: "GET" }),
  post: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = any>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(url: string) => apiRequest<T>(url, { method: "DELETE" }),
};
