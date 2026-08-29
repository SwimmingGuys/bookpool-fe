import { AuthError, type ApiErrorCode, type FieldError } from '@/lib/api/errors'

// 백엔드 베이스 경로. 기본값 '/api'는 Vite dev 프록시(같은 오리진)를 전제로 한다.
// 다른 오리진으로 직접 호출하려면 VITE_API_BASE_URL에 전체 URL을 지정한다.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '')

// Spring 백엔드 엔드포인트. 명세 확정 시 이 한 곳만 수정한다.
export const ENDPOINTS = {
  login: '/login',
  signup: '/signup',
  reissue: '/reissue',
  logout: '/logout',
  // 회원가입 이메일 인증 (EmailVerificationController)
  emailSendCode: '/signup/email/code',
  emailVerify: '/signup/email/verify',
  // 비밀번호 재설정 (방식 A — 코드 기반)
  resetSendCode: '/password/email/code',
  resetVerify: '/password/email/verify',
  resetPassword: '/password/reset',
  // 내 정보 조회 (MemberController)
  me: '/me',
  // 비밀번호 변경 (로그인 상태)
  changePassword: '/me/password',
  // 프로필 수정 (명세 미확정 — 확인 후 조정)
  updateProfile: '/members/me',
  // 마케팅 수신 동의 토글
  emailSubscription: '/me/email-subscription',

  // 공고(캠페인)
  campaigns: '/campaigns',
  campaignPublishers: '/campaigns/publishers',
  campaignCategoryCounts: '/campaigns/category-counts',
  adminCampaigns: '/admin/campaigns',

  // 내 활동
  bookmarks: '/me/bookmarks',
  bookmarkIds: '/me/bookmarks/ids',
  recentViews: '/me/recent-views',
  recentViewIds: '/me/recent-views/ids',
  applications: '/me/applications',

  // 알림
  notificationSubscription: '/me/notification-subscription',
  notifications: '/me/notifications',

  // 공지사항
  notices: '/notices',
  adminNotices: '/admin/notices',

  // 1:1 문의
  inquiries: '/inquiries',
  adminInquiries: '/admin/inquiries',

  // 서평(리뷰)
  reviews: '/reviews',
  adminReviews: '/admin/reviews',

  // 이미지 업로드
  uploads: '/uploads/images',
} as const

// 백엔드 공통 응답 래퍼 (kr.co.bookpool.common.response.ApiResult)
export interface ApiResult<T> {
  success: boolean
  code: string
  message: string
  data: T
}

// Spring Data Page를 그대로 옮긴 목록 응답
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export const EMPTY_PAGE: PageResponse<never> = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
}

// 백엔드 에러 코드 → 프론트 ApiErrorCode 매핑. 명세 추가 시 여기에 항목을 늘린다.
const SERVER_CODE_MAP: Record<string, ApiErrorCode> = {
  M001: 'EMAIL_EXISTS', // 이미 사용 중인 이메일 (회원가입)
  M002: 'USER_NOT_FOUND', // 가입되지 않은 이메일 (비밀번호 재설정 코드 발송)
  M004: 'CODE_INVALID', // 인증 코드가 올바르지 않거나 만료됨
  M005: 'PASSWORD_INCORRECT', // 현재 비밀번호 불일치 (비밀번호 변경)
  M006: 'EMAIL_NOT_VERIFIED', // 이메일 인증 미완료 (비밀번호 재설정)
  A002: 'NOT_AUTHENTICATED', // 유효하지 않은 인증 정보
  A003: 'FORBIDDEN', // 권한 없음
  C001: 'VALIDATION', // 입력값 검증 실패 (data에 필드별 에러 배열)
  C002: 'NOT_FOUND', // 리소스 없음
}

const KNOWN_CODES: ReadonlySet<ApiErrorCode> = new Set<ApiErrorCode>([
  'EMAIL_EXISTS',
  'INVALID_CREDENTIALS',
  'USER_NOT_FOUND',
  'CODE_INVALID',
  'CODE_EXPIRED',
  'EMAIL_NOT_VERIFIED',
  'PASSWORD_INCORRECT',
  'NOT_AUTHENTICATED',
  'VALIDATION',
  'SIGNUP_LOGIN_FAILED',
  'NETWORK',
  'NOT_FOUND',
  'FORBIDDEN',
  'SERVER',
])

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  EMAIL_EXISTS: '이미 가입된 이메일입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  USER_NOT_FOUND: '가입되지 않은 이메일입니다.',
  CODE_INVALID: '인증번호가 일치하지 않습니다.',
  CODE_EXPIRED: '인증번호가 만료되었습니다. 다시 발송해주세요.',
  EMAIL_NOT_VERIFIED: '이메일 인증을 완료해주세요.',
  PASSWORD_INCORRECT: '현재 비밀번호가 올바르지 않습니다.',
  NOT_AUTHENTICATED: '로그인이 필요합니다.',
  VALIDATION: '입력값을 확인해주세요.',
  SIGNUP_LOGIN_FAILED: '회원가입은 완료됐어요. 로그인 페이지에서 다시 로그인해주세요.',
  NETWORK: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  SERVER: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
}

// accessToken은 메모리 보관이 원칙이나, 새로고침 시 UX 유지를 위해 lib/auth.ts가
// 영속 스토어와 동기화한다. 이 모듈은 현재 토큰을 들고 헤더에 실어 보내는 역할만 한다.
let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null
let onTokenRefreshed: ((token: string) => void) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function configureClient(handlers: {
  onUnauthorized?: () => void
  onTokenRefreshed?: (token: string) => void
}) {
  onUnauthorized = handlers.onUnauthorized ?? null
  onTokenRefreshed = handlers.onTokenRefreshed ?? null
}

type QueryValue =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | null
  | undefined

interface RequestOptions {
  method?: string
  body?: unknown
  // Authorization 헤더 부착 여부 (기본 true). 로그인/회원가입 등 공개 요청은 false.
  auth?: boolean
  // 401 응답 시 /reissue로 재발급 후 재시도할지 (기본 true).
  retryOnAuth?: boolean
  // 쿼리 파라미터. 빈 문자열·null·undefined는 생략하고, 배열은 같은 키로 반복한다.
  query?: Record<string, QueryValue>
  // 공용 accessToken 대신 쓸 토큰. 관리자 세션처럼 별도 토큰을 쓰는 호출에 사용한다.
  token?: string | null
}

// BASE_URL이 상대경로('/api')일 수도 절대 URL일 수도 있어, URL 객체 대신
// 쿼리 문자열만 만들어 경로 뒤에 붙인다.
function buildPath(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return path
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)))
      return
    }
    params.set(key, String(value))
  })
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

function rawFetch(
  path: string,
  method: string,
  body: unknown,
  auth: boolean,
  token: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const bearer = token ?? accessToken
  if (auth && bearer) headers.Authorization = `Bearer ${bearer}`
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

// refreshToken(httpOnly 쿠키)으로 accessToken을 재발급한다.
// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 수행한다.
let reissueInFlight: Promise<boolean> | null = null

function tryReissue(): Promise<boolean> {
  if (reissueInFlight) return reissueInFlight
  reissueInFlight = (async () => {
    try {
      const res = await fetch(`${BASE_URL}${ENDPOINTS.reissue}`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) return false
      const body = (await res.json()) as ApiResult<{ accessToken?: string }>
      const token = body?.data?.accessToken
      if (!token) return false
      accessToken = token
      onTokenRefreshed?.(token)
      return true
    } catch {
      return false
    } finally {
      reissueInFlight = null
    }
  })()
  return reissueInFlight
}

async function toAuthError(response: Response): Promise<AuthError> {
  let code = fallbackCode(response.status)
  let message = DEFAULT_MESSAGES[code]
  let fields: FieldError[] | undefined
  try {
    const body = (await response.json()) as {
      code?: string
      message?: string
      data?: unknown
    }
    code = mapServerCode(body.code, response.status)
    message = body.message?.trim() || DEFAULT_MESSAGES[code]
    fields = parseFieldErrors(body.data)
  } catch {
    // 본문이 없거나 JSON이 아니면 상태코드 기반 기본값을 사용한다.
  }
  return new AuthError(code, message, fields)
}

// 검증 실패(C001) 응답의 data 배열 → 필드별 에러로 변환
function parseFieldErrors(data: unknown): FieldError[] | undefined {
  if (!Array.isArray(data)) return undefined
  const fields = data.filter(
    (item): item is FieldError =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as FieldError).field === 'string' &&
      typeof (item as FieldError).message === 'string',
  )
  return fields.length > 0 ? fields : undefined
}

function mapServerCode(serverCode: string | undefined, status: number): ApiErrorCode {
  if (!serverCode) return fallbackCode(status)
  if (SERVER_CODE_MAP[serverCode]) return SERVER_CODE_MAP[serverCode]
  // 백엔드가 ApiErrorCode와 동일한 코드를 내려주는 경우도 허용
  if (KNOWN_CODES.has(serverCode as ApiErrorCode)) return serverCode as ApiErrorCode
  return fallbackCode(status)
}

function fallbackCode(status: number): ApiErrorCode {
  if (status >= 500) return 'SERVER'
  switch (status) {
    case 401:
      return 'NOT_AUTHENTICATED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'EMAIL_EXISTS'
    default:
      return 'NETWORK'
  }
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    retryOnAuth = true,
    query,
    token = null,
  } = options
  const fullPath = buildPath(path, query)

  let response: Response
  try {
    response = await rawFetch(fullPath, method, body, auth, token)
  } catch {
    throw new AuthError('NETWORK', DEFAULT_MESSAGES.NETWORK)
  }

  // 별도 토큰을 명시한 요청(관리자 등)은 공용 refreshToken으로 재발급할 수 없다.
  if (response.status === 401 && auth && retryOnAuth && token === null) {
    const refreshed = await tryReissue()
    if (refreshed) {
      try {
        response = await rawFetch(fullPath, method, body, auth, token)
      } catch {
        throw new AuthError('NETWORK', DEFAULT_MESSAGES.NETWORK)
      }
    } else {
      onUnauthorized?.()
    }
  }

  if (!response.ok) {
    throw await toAuthError(response)
  }
  // 모든 성공 응답은 ApiResult로 감싸져 있으므로 data만 꺼내 반환한다.
  const result = await parseBody<ApiResult<T>>(response)
  return (result ? result.data : undefined) as T
}

// multipart 업로드는 JSON 직렬화를 거치지 않으므로 별도 경로를 쓴다.
export async function apiUpload<T>(
  path: string,
  file: File,
  fieldName = 'file',
): Promise<T> {
  const form = new FormData()
  form.append(fieldName, file)

  const headers: Record<string, string> = {}
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: form,
    })
  } catch {
    throw new AuthError('NETWORK', DEFAULT_MESSAGES.NETWORK)
  }

  if (!response.ok) throw await toAuthError(response)
  const result = await parseBody<ApiResult<T>>(response)
  return (result ? result.data : undefined) as T
}
