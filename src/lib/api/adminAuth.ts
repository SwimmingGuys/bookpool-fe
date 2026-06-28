import type { Admin } from '@/types/admin'

const MOCK_LATENCY_MS = 400

// 시드된 백오피스 관리자 계정. 실제 백엔드가 붙기 전까지 사용하는 데모 자격증명이다.
// 로그인: username = 'admin', password = 'admin1234'
const SEED_ADMINS: (Admin & { password: string })[] = [
  { id: 'admin_seed_1', username: 'admin', password: 'admin1234', name: '관리자' },
]

export type AdminAuthErrorCode = 'INVALID_CREDENTIALS' | 'NOT_AUTHENTICATED'

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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeToken(adminId: string): string {
  const payload = `${adminId}.${Date.now()}.${Math.random().toString(36).slice(2)}`
  return typeof btoa === 'function' ? btoa(payload) : payload
}

function toPublicAdmin({ password: _password, ...rest }: Admin & { password: string }): Admin {
  return rest
}

export async function login(payload: AdminLoginPayload): Promise<AdminAuthResponse> {
  await delay(MOCK_LATENCY_MS)
  const username = payload.username.trim().toLowerCase()
  const found = SEED_ADMINS.find(
    (a) => a.username === username && a.password === payload.password,
  )
  if (!found) {
    throw new AdminAuthError(
      'INVALID_CREDENTIALS',
      '아이디 또는 비밀번호가 올바르지 않습니다.',
    )
  }
  return { admin: toPublicAdmin(found), accessToken: makeToken(found.id) }
}
