type QueryValue = string | number | boolean | readonly (string | number | boolean)[] | null | undefined

interface ApiResult<T> {
  success: boolean
  code: string
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export class ApiError extends Error {
  status: number
  code: string
  data: unknown

  constructor(status: number, code: string, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080'

function readStoredToken(storageKey: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { accessToken?: unknown }
    return typeof parsed.accessToken === 'string' ? parsed.accessToken : null
  } catch {
    return null
  }
}

function tokenFor(auth: RequestOptions['auth']): string | null {
  if (auth === 'admin') return readStoredToken('bookpool:admin-auth')
  if (auth === 'user') return readStoredToken('bookpool:auth-v2')
  return null
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path, `${API_BASE_URL}/`)
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)))
      return
    }
    url.searchParams.set(key, String(value))
  })
  return url.toString()
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  auth?: 'user' | 'admin'
  accessToken?: string
  body?: unknown
  query?: Record<string, QueryValue>
}

export async function apiRequest<T>(
  path: string,
  { auth, accessToken, body, query, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const token = accessToken ?? tokenFor(auth)
  const requestHeaders = new Headers(headers)
  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }
  if (token) requestHeaders.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      headers: requestHeaders,
    })
  } catch {
    throw new ApiError(0, 'NETWORK', '서버에 연결할 수 없습니다.')
  }

  const payload = (await response.json().catch(() => null)) as ApiResult<T> | null
  if (!response.ok || !payload?.success) {
    throw new ApiError(
      response.status,
      payload?.code ?? 'HTTP_ERROR',
      payload?.message ?? '요청 처리 중 오류가 발생했습니다.',
      payload?.data,
    )
  }
  return payload.data
}
