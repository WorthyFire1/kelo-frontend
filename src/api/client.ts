import { authTokenStorage } from '@/lib/authTokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://26.103.41.226/api';

export function resolveApiAssetUrl(path?: string | null): string | undefined {
  const value = path?.trim();
  if (!value) return undefined;

  try {
    if (/^https?:\/\//i.test(value)) return value;
    const apiOrigin = new URL(API_BASE_URL).origin;
    return new URL(value.replace(/^\.?\//, ''), `${apiOrigin}/`).toString();
  } catch {
    return undefined;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = authTokenStorage.get();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    let message = responseText;
    try {
      const parsed = JSON.parse(responseText) as { message?: string; error?: string };
      message = parsed.message ?? parsed.error ?? responseText;
    } catch {
      // Сервер может вернуть обычный текст вместо JSON.
    }
    throw new ApiError(message || 'Ошибка запроса', response.status);
  }

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}
