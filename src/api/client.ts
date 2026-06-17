import { initData } from '@telegram-apps/sdk-react';

export const DEV_SERVER_KEY = 'easydesk_dev_server';
export const MOCK_DEMO_VALUE = 'mock://demo';

export const KNOWN_SERVERS = {
  production: 'https://easydesk.soknight.ru/api/v1',
  development: 'http://localhost:8080/api/v1',
} as const;

export function getBaseUrl(): string {
  const stored = localStorage.getItem(DEV_SERVER_KEY);
  if (stored) return stored;
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1';
}

export function isMockMode(): boolean {
  return localStorage.getItem(DEV_SERVER_KEY) === MOCK_DEMO_VALUE;
}

export function setDevServer(origin: string | null): void {
  if (origin === null) {
    localStorage.removeItem(DEV_SERVER_KEY);
  } else {
    localStorage.setItem(DEV_SERVER_KEY, origin);
  }
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAuthHeader(): string | null {
  try {
    const raw = initData.raw();
    return raw ? `tma ${raw}` : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = getAuthHeader();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error_message: `HTTP ${res.status}` })) as { error_message?: string };
    throw new ApiError(res.status, err.error_message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function requestForm<T>(path: string, body: FormData, method = 'POST'): Promise<T> {
  const auth = getAuthHeader();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    body,
    headers: {
      ...(auth ? { Authorization: auth } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error_message: `HTTP ${res.status}` })) as { error_message?: string };
    throw new ApiError(res.status, err.error_message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
  get: <T>(path: string) => request<T>(path),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: <T>(path: string, body: FormData) => requestForm<T>(path, body),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
};
