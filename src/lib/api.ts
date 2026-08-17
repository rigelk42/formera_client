const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  fields?: Record<string, string[]>

  constructor(status: number, message: string, fields?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

// DRF returns either {"detail": "..."} for auth/permission errors, or
// {"field_name": ["message", ...]} for serializer validation errors --
// surface the first field message so callers see something more useful
// than a generic failure (e.g. "customer with this email already exists").
function parseErrorBody(body: unknown): {
  message: string
  fields?: Record<string, string[]>
} {
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>
    if (typeof obj.detail === 'string') {
      return { message: obj.detail }
    }

    const fields: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        fields[key] = value
      }
    }
    const firstMessage = Object.values(fields)[0]?.[0]
    if (firstMessage) {
      return { message: firstMessage, fields }
    }
  }
  return { message: 'Request failed' }
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
    const { message, fields } = parseErrorBody(body)
    throw new ApiError(response.status, message, fields)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json()
}
