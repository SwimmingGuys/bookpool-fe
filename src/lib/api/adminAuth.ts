import { apiRequest, ENDPOINTS } from '@/lib/api/client'
import { AuthError } from '@/lib/api/errors'
import type { Admin } from '@/types/admin'

export { AuthError as AdminAuthError }

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
}

interface MeResponse {
  id: number | string
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

// 관리자 세션은 일반 사용자 세션과 완전히 분리한다. 공용 accessToken을 건드리지 않도록
// 로그인으로 받은 토큰을 `token` 옵션으로 직접 실어 보낸다.
export async function login(
  payload: AdminLoginPayload,
): Promise<AdminAuthResponse> {
  const { accessToken } = await apiRequest<LoginResponse>(ENDPOINTS.login, {
    method: 'POST',
    auth: false,
    retryOnAuth: false,
    body: {
      email: payload.username.trim().toLowerCase(),
      password: payload.password,
    },
  })

  const me = await apiRequest<MeResponse>(ENDPOINTS.me, {
    token: accessToken,
    retryOnAuth: false,
  })

  if (me.role !== 'ADMIN') {
    throw new AuthError('FORBIDDEN', '관리자 권한이 없는 계정입니다.')
  }

  return { admin: toAdmin(me), accessToken }
}
