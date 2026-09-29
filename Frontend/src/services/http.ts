export function apiBase() {
  if (typeof window !== 'undefined' && window.location.hostname === 'sanketra-qqmi.vercel.app') return '/api'
  const value = import.meta.env.VITE_API_URL
  if (typeof value === 'string' && value.length > 0) return value.replace(/\/$/, '')
  return '/api'
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; body: T }> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  const body = (await response.json().catch(() => ({}))) as T
  return { ok: response.ok, status: response.status, body }
}
