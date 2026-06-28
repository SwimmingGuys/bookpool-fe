import { apiRequest, ApiError } from '@/lib/api/http'
import type { Admin } from '@/types/admin'

export type AdminAuthErrorCode = 'INVALID_CREDENTIALS' | 'NOT_AUTHENTICATED' | 'FORBIDDEN' | string

export class AdminAuthError extends Error {
  code: AdminAuthErrorCode

  constructor(code: AdminAuthErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'AdminAuthError'
  }
}

export interface AdminLoginPayload {
  username: string
  password: string
}

export interface AdminAuthResponse {
  admin: Admin
  accessToken: string
}

interface LoginResponse {
  accessToken: string
  tokenType: string
}

interface MeResponse {
  id: number
  email: string
  nickname: string
  role: string
}

function toAdmin(response: MeResponse): Admin {
  return {
    id: String(response.id),
    username: response.email,
    name: response.nickname,
  }
}

function toAdminAuthError(error: unknown): AdminAuthError {
  if (error instanceof ApiError) {
    return new AdminAuthError(error.code, error.message)
  }
  return new AdminAuthError('NOT_AUTHENTICATED', '로그인에 실패했습니다.')
}

export async function login(
  payload: AdminLoginPayload,
): Promise<AdminAuthResponse> {
  try {
    const loginResponse = await apiRequest<LoginResponse>('/api/login', {
      method: 'POST',
      body: {
        email: payload.username.trim().toLowerCase(),
        password: payload.password,
      },
    })
    const me = await apiRequest<MeResponse>('/api/me', {
      accessToken: loginResponse.accessToken,
    })
    if (me.role !== 'ADMIN') {
      throw new AdminAuthError('FORBIDDEN', '관리자 권한이 없는 계정입니다.')
    }
    return { admin: toAdmin(me), accessToken: loginResponse.accessToken }
  } catch (error) {
    if (error instanceof AdminAuthError) throw error
    throw toAdminAuthError(error)
  }
}
