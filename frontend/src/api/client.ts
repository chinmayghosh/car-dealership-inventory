/** Base URL of the backend. Empty in development, where Vite proxies /api to the backend. */
const API_URL = import.meta.env.VITE_API_URL ?? '';

const TOKEN_KEY = 'apex.token';

/** Where the JWT lives between page loads. Wrapped so storage failures never crash the app. */
export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable: the session simply won't survive a reload */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/** Fired on window when the server rejects our token, so the UI can log the user out. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Validation messages keyed by field name, e.g. { price: 'Price must be greater than 0' }. */
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

interface ErrorBody {
  message?: string;
  errors?: { field: string; message: string }[];
}

export async function apiRequest<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Please check your connection and try again.');
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    const { message, errors = [] } = data as ErrorBody;
    const fieldErrors = Object.fromEntries(errors.map((e) => [e.field, e.message]));
    throw new ApiError(response.status, message ?? 'Something went wrong', fieldErrors);
  }

  return data as T;
}
