import type { User } from '@/types/user'

const USERS_KEY = 'bookpool:mock-users'
const MOCK_LATENCY_MS = 400
const VERIFICATION_TTL_MS = 5 * 60 * 1000
const VERIFICATION_CODE_LENGTH = 6

interface StoredUser extends User {
  password: string
}

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
  constructor(public code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export type VerificationIntent = 'signup' | 'reset'

const verificationCodes = new Map<string, { code: string; expiresAt: number }>()
const verifiedEmails = new Set<string>()

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : []
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function makeToken(userId: string): string {
  const payload = `${userId}.${Date.now()}.${Math.random().toString(36).slice(2)}`
  return typeof btoa === 'function' ? btoa(payload) : payload
}

function toPublicUser({ password: _password, ...rest }: StoredUser): User {
  return rest
}

function generateCode(): string {
  return Array.from({ length: VERIFICATION_CODE_LENGTH }, () =>
    Math.floor(Math.random() * 10),
  ).join('')
}

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

export async function sendVerificationCode(
  email: string,
  options: { intent: VerificationIntent } = { intent: 'signup' },
): Promise<{ code: string }> {
  await delay(MOCK_LATENCY_MS)
  const normalized = normalizeEmail(email)
  const exists = loadUsers().some((u) => u.email === normalized)

  if (options.intent === 'signup' && exists) {
    throw new AuthError('EMAIL_EXISTS', '이미 가입된 이메일입니다.')
  }
  if (options.intent === 'reset' && !exists) {
    throw new AuthError('USER_NOT_FOUND', '가입되지 않은 이메일입니다.')
  }

  verifiedEmails.delete(normalized)
  const code = generateCode()
  verificationCodes.set(normalized, {
    code,
    expiresAt: Date.now() + VERIFICATION_TTL_MS,
  })
  return { code }
}

export async function verifyCode(email: string, code: string): Promise<void> {
  await delay(MOCK_LATENCY_MS)
  const normalized = normalizeEmail(email)
  const entry = verificationCodes.get(normalized)
  if (!entry) {
    throw new AuthError('CODE_INVALID', '인증번호를 먼저 발송해주세요.')
  }
  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(normalized)
    throw new AuthError(
      'CODE_EXPIRED',
      '인증번호가 만료되었습니다. 다시 발송해주세요.',
    )
  }
  if (entry.code !== code.trim()) {
    throw new AuthError('CODE_INVALID', '인증번호가 일치하지 않습니다.')
  }
  verifiedEmails.add(normalized)
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  await delay(MOCK_LATENCY_MS)
  const normalized = normalizeEmail(payload.email)

  if (!verifiedEmails.has(normalized)) {
    throw new AuthError('EMAIL_NOT_VERIFIED', '이메일 인증을 완료해주세요.')
  }

  const users = loadUsers()
  if (users.some((u) => u.email === normalized)) {
    throw new AuthError('EMAIL_EXISTS', '이미 가입된 이메일입니다.')
  }

  const user: StoredUser = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    email: normalized,
    password: payload.password,
    nickname: payload.nickname.trim(),
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, user])
  verifiedEmails.delete(normalized)
  verificationCodes.delete(normalized)

  return { user: toPublicUser(user), accessToken: makeToken(user.id) }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  await delay(MOCK_LATENCY_MS)
  const normalized = normalizeEmail(payload.email)
  const found = loadUsers().find(
    (u) => u.email === normalized && u.password === payload.password,
  )
  if (!found) {
    throw new AuthError(
      'INVALID_CREDENTIALS',
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    )
  }
  return { user: toPublicUser(found), accessToken: makeToken(found.id) }
}

export async function updateProfile(
  userId: string,
  payload: UpdateProfilePayload,
): Promise<User> {
  await delay(MOCK_LATENCY_MS)
  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) {
    throw new AuthError('NOT_AUTHENTICATED', '로그인이 필요합니다.')
  }
  const trimmedContact = payload.contact?.trim() ?? ''
  users[idx] = {
    ...users[idx],
    nickname: payload.nickname.trim(),
    contact: trimmedContact === '' ? undefined : trimmedContact,
  }
  saveUsers(users)
  return toPublicUser(users[idx])
}

export async function changePassword(
  userId: string,
  payload: ChangePasswordPayload,
): Promise<void> {
  await delay(MOCK_LATENCY_MS)
  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) {
    throw new AuthError('NOT_AUTHENTICATED', '로그인이 필요합니다.')
  }
  if (users[idx].password !== payload.currentPassword) {
    throw new AuthError('PASSWORD_INCORRECT', '현재 비밀번호가 올바르지 않습니다.')
  }
  users[idx].password = payload.newPassword
  saveUsers(users)
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await delay(MOCK_LATENCY_MS)
  const normalized = normalizeEmail(payload.email)

  if (!verifiedEmails.has(normalized)) {
    throw new AuthError('EMAIL_NOT_VERIFIED', '이메일 인증을 완료해주세요.')
  }

  const users = loadUsers()
  const idx = users.findIndex((u) => u.email === normalized)
  if (idx === -1) {
    throw new AuthError('USER_NOT_FOUND', '가입되지 않은 이메일입니다.')
  }
  users[idx].password = payload.newPassword
  saveUsers(users)
  verificationCodes.delete(normalized)
  verifiedEmails.delete(normalized)
}
