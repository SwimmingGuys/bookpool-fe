import type { User } from '@/types/user'
import { apiRequest, ENDPOINTS, setAccessToken } from '@/lib/api/client'
import { AuthError } from '@/lib/api/errors'

export { AuthError }
export type { AuthErrorCode, FieldError } from '@/lib/api/errors'

export interface AuthResponse {
  user: User
  accessToken: string
}

export type VerificationIntent = 'signup' | 'reset'

export interface SignupPayload {
  email: string
  password: string
  nickname: string
  // 마케팅 이메일 수신 동의 (미지정 시 false). 동의 체크박스 추가 시 연결.
  emailSubscribed?: boolean
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

// 백엔드 회원 DTO → 프론트 User 매핑. 필드명 차이는 이 함수 안에서만 흡수한다.
// MeResponse: { id, email, nickname, role }. contact/createdAt은 응답에 없을 수 있다.
interface MemberDto {
  id: string | number
  email: string
  nickname: string
  role?: string
  contact?: string | null
  createdAt?: string
}

function toUser(dto: MemberDto): User {
  return {
    id: String(dto.id),
    email: dto.email,
    nickname: dto.nickname,
    role: dto.role,
    contact: dto.contact ?? undefined,
    createdAt: dto.createdAt,
  }
}

// 백엔드 LoginResponse (accessToken만 담김 — 회원 정보는 별도 조회)
interface LoginResponse {
  accessToken: string
}

// 백엔드 SignUpResponse (가입 결과 — 토큰 없음)
interface SignUpResponse {
  id: number
  email: string
  nickname: string
}

// 로그인/회원가입 응답엔 회원 정보가 없으므로, 토큰을 세팅한 뒤 프로필을 조회한다.
async function fetchProfile(): Promise<User> {
  const member = await apiRequest<MemberDto>(ENDPOINTS.me)
  return toUser(member)
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { accessToken } = await apiRequest<LoginResponse>(ENDPOINTS.login, {
    method: 'POST',
    auth: false,
    retryOnAuth: false,
    body: { email: normalizeEmail(payload.email), password: payload.password },
  })
  setAccessToken(accessToken)
  const user = await fetchProfile()
  return { user, accessToken }
}

// 회원가입은 계정만 생성하고 토큰을 주지 않으므로(201), 가입 직후 로그인을 이어 붙여
// 기존의 "가입 즉시 로그인" UX를 유지한다.
export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const email = normalizeEmail(payload.email)
  await apiRequest<SignUpResponse>(ENDPOINTS.signup, {
    method: 'POST',
    auth: false,
    retryOnAuth: false,
    body: {
      email,
      nickname: payload.nickname.trim(),
      password: payload.password,
      emailSubscribed: payload.emailSubscribed ?? false,
    },
  })
  // 가입은 성공했으나 이어붙인 자동 로그인이 실패하면, 가입 실패로 오인하지 않도록
  // 별도 코드로 구분해 호출부에서 로그인 페이지로 유도한다.
  try {
    return await login({ email, password: payload.password })
  } catch {
    throw new AuthError(
      'SIGNUP_LOGIN_FAILED',
      '회원가입은 완료됐어요. 로그인 페이지에서 다시 로그인해주세요.',
    )
  }
}

export async function logout(): Promise<void> {
  await apiRequest<void>(ENDPOINTS.logout, { method: 'POST', retryOnAuth: false })
}

// 백엔드 요청 DTO (EmailCodeRequest / EmailVerifyRequest)
interface EmailCodeRequest {
  email: string
}

interface EmailVerifyRequest {
  email: string
  code: string
}

export async function sendVerificationCode(
  email: string,
  options: { intent: VerificationIntent } = { intent: 'signup' },
): Promise<void> {
  const path =
    options.intent === 'reset' ? ENDPOINTS.resetSendCode : ENDPOINTS.emailSendCode
  const body: EmailCodeRequest = { email: normalizeEmail(email) }
  await apiRequest<void>(path, {
    method: 'POST',
    auth: false,
    retryOnAuth: false,
    body,
  })
}

export async function verifyCode(
  email: string,
  code: string,
  options: { intent: VerificationIntent } = { intent: 'signup' },
): Promise<void> {
  const path =
    options.intent === 'reset' ? ENDPOINTS.resetVerify : ENDPOINTS.emailVerify
  const body: EmailVerifyRequest = { email: normalizeEmail(email), code: code.trim() }
  await apiRequest<void>(path, {
    method: 'POST',
    auth: false,
    retryOnAuth: false,
    body,
  })
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await apiRequest<void>(ENDPOINTS.resetPassword, {
    method: 'POST',
    auth: false,
    retryOnAuth: false,
    body: { email: normalizeEmail(payload.email), newPassword: payload.newPassword },
  })
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const contact = payload.contact?.trim()
  const data = await apiRequest<MemberDto>(ENDPOINTS.updateProfile, {
    method: 'PATCH',
    body: {
      nickname: payload.nickname.trim(),
      contact: contact === '' ? null : contact,
    },
  })
  return toUser(data)
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiRequest<void>(ENDPOINTS.changePassword, {
    method: 'PATCH',
    body: {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    },
  })
}
