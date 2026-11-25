export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    '',
  ) || 'http://localhost:3000';

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      if (!res.ok) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
      }
      const data = (await res.json()) as { tokens: { accessToken: string } };
      localStorage.setItem('accessToken', data.tokens.accessToken);
      return data.tokens.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json');
  if (options.auth !== false) {
    const token = localStorage.getItem('accessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  if (response.status === 401 && options.auth !== false) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    }
  }
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const problem = await response.json();
      message = problem.detail || problem.title || message;
    } catch {
      // The response may not contain a JSON problem-details body.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
