import { API_BASE_URL } from '@/components/api';

type JsonBody = object;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: JsonBody | string | null;
  skipJson?: boolean;
}

/**
 * Small wrapper around fetch so we only define headers, URL joining
 * and JSON parsing in one place. Makes it easier to reuse logic across
 * login, register and future requests.
 */
export async function request<TResponse>(
  path: string,
  { body, headers, skipJson, ...init }: RequestOptions = {}
): Promise<TResponse> {
  const payload =
    typeof body === 'string' || body === null || body === undefined
      ? body ?? undefined
      : JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: payload,
    ...init,
  });

  const text = await response.text();
  const data = skipJson ? (text as unknown as TResponse) : (JSON.parse(text || '{}') as TResponse);

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data ? (data as any).error : text;
    throw new Error(message || 'Error de conexión');
  }

  return data;
}
