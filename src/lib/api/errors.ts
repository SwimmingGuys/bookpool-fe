// 인증 흐름에서 분기에 쓰는 코드. 백엔드 에러코드 → 이 코드로 매핑된다.
export type AuthErrorCode =
  | 'EMAIL_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'CODE_INVALID'
  | 'CODE_EXPIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'PASSWORD_INCORRECT'
  | 'NOT_AUTHENTICATED'
  | 'VALIDATION'
  | 'SIGNUP_LOGIN_FAILED'
  | 'NETWORK'

// 인증 외 도메인(공고·공지·문의·리뷰)에서 함께 쓰는 코드.
export type ApiErrorCode = AuthErrorCode | 'NOT_FOUND' | 'FORBIDDEN' | 'SERVER'

// 백엔드 검증 실패(C001) 응답의 필드별 에러
export interface FieldError {
  field: string
  message: string
}

// 모든 API 실패는 이 에러 하나로 던진다. 호출부는 `.code`로 분기하고 `.message`를
// 그대로 노출한다(백엔드 메시지가 이미 한국어).
export class AuthError extends Error {
  code: ApiErrorCode
  fields?: FieldError[]

  constructor(code: ApiErrorCode, message: string, fields?: FieldError[]) {
    super(message)
    this.code = code
    this.name = 'AuthError'
    this.fields = fields
  }
}

// 인증 외 도메인에서 의미가 맞는 이름으로 쓰기 위한 별칭.
export { AuthError as ApiError }

export function isNotFound(error: unknown): boolean {
  return error instanceof AuthError && error.code === 'NOT_FOUND'
}
