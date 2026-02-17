// NEXT_PUBLIC_API_URL is inlined at build time by Next.js.
// In Docker: set via build arg. In local dev: set in .env.local.
// The browser calls the API directly (with CORS).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      ...headers,
    },
    credentials: 'include',
  };

  if (body && !(body instanceof FormData)) {
    config.headers = { ...config.headers, 'Content-Type': 'application/json' };
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    config.body = body;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(res.status, data.message || 'Request failed', data.details);
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: any) => request<T>(url, { method: 'POST', body }),
  put: <T>(url: string, body?: any) => request<T>(url, { method: 'PUT', body }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
  upload: <T>(url: string, formData: FormData) => request<T>(url, { method: 'POST', body: formData }),
};
