import { apiRequest, ApiError } from '@/lib/api/http'
import type { User } from '@/types/user'

export type AuthErrorCode =
  | 'EMAIL_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'CODE_INVALID'
  | 'CODE_EXPIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'PASSWORD_INCORRECT'
  | 'NOT_AUTHENTICATED'
  | 'NETWORK'

export class AuthError extends Error {
  code: AuthErrorCode | string

  constructor(code: AuthErrorCode | string, message: string) {
    super(message)
    this.code = code
    this.name = 'AuthError'
  }
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export type VerificationIntent = 'signup' | 'reset'

export interface SignupPayload {
  email: string
  password: string
  nickname: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ResetPasswordPayload {
  email: string
  newPassword: string
}

export interface UpdateProfilePayload {
  nickname: string
  contact?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

interface LoginResponse {
  accessToken: string
  tokenType: string
}

interface MeResponse {
  id: number
  email: string
  nickname: string
  contact?: string | null
  emailSubscribed: boolean
  role: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function toAuthError(error: unknown): AuthError {
  if (error instanceof ApiError) {
    return new AuthError(error.code, error.message)
  }
  return new AuthError('NETWORK', '요청 처리 중 오류가 발생했습니다.')
}

function toUser(response: MeResponse): User {
  return {
    id: String(response.id),
    email: response.email,
    nickname: response.nickname,
    contact: response.contact ?? undefined,
    createdAt: '',
  }
}

async function getMe(accessToken?: string): Promise<User> {
  return toUser(
    await apiRequest<MeResponse>('/api/me', {
      auth: accessToken ? undefined : 'user',
      accessToken,
    }),
  )
}

export async function sendVerificationCode(
  email: string,
  options: { intent: VerificationIntent } = { intent: 'signup' },
): Promise<void> {
  try {
    await apiRequest<void>(
      options.intent === 'signup'
        ? '/api/signup/email/code'
        : '/api/password/email/code',
      {
        method: 'POST',
        body: { email: normalizeEmail(email) },
      },
    )
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function verifyCode(email: string, code: string): Promise<void> {
  try {
    await apiRequest<void>('/api/signup/email/verify', {
      method: 'POST',
      body: { email: normalizeEmail(email), code: code.trim() },
    })
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function verifyResetCode(email: string, code: string): Promise<void> {
  try {
    await apiRequest<void>('/api/password/email/verify', {
      method: 'POST',
      body: { email: normalizeEmail(email), code: code.trim() },
    })
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  try {
    await apiRequest('/api/signup', {
      method: 'POST',
      body: {
        email: normalizeEmail(payload.email),
        password: payload.password,
        nickname: payload.nickname.trim(),
        emailSubscribed: false,
      },
    })
    return login({ email: payload.email, password: payload.password })
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await apiRequest<LoginResponse>('/api/login', {
      method: 'POST',
      body: {
        email: normalizeEmail(payload.email),
        password: payload.password,
      },
    })
    const user = await getMe(response.accessToken)
    return { user, accessToken: response.accessToken }
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>('/api/logout', {
      method: 'POST',
      auth: 'user',
    })
  } catch {
    // 클라이언트 세션은 항상 정리한다.
  }
}

export async function updateProfile(
  _userId: string,
  payload: UpdateProfilePayload,
): Promise<User> {
  try {
    return toUser(
      await apiRequest<MeResponse>('/api/me', {
        method: 'PATCH',
        auth: 'user',
        body: {
          nickname: payload.nickname.trim(),
          contact: payload.contact?.trim() || null,
        },
      }),
    )
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function changePassword(
  _userId: string,
  payload: ChangePasswordPayload,
): Promise<void> {
  try {
    await apiRequest<void>('/api/me/password', {
      method: 'PATCH',
      auth: 'user',
      body: payload,
    })
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  try {
    await apiRequest<void>('/api/password/reset', {
      method: 'POST',
      body: {
        email: normalizeEmail(payload.email),
        newPassword: payload.newPassword,
      },
    })
  } catch (error) {
    throw toAuthError(error)
  }
}
