const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function requestWithRefresh(
  path: string,
  init: RequestInit,
  allowRefresh: boolean,
): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
  })

  if (response.status !== 401 || !allowRefresh || path === '/api/auth/refresh/') {
    return response
  }

  const refreshed = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!refreshed.ok) {
    return response
  }

  return requestWithRefresh(path, init, false)
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await requestWithRefresh(
    path,
    {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    },
    true,
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.detail ?? 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json()
}
