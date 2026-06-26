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

// 백엔드 검증 실패(C001) 응답의 필드별 에러
export interface FieldError {
  field: string
  message: string
}

export class AuthError extends Error {
  code: AuthErrorCode
  fields?: FieldError[]

  constructor(code: AuthErrorCode, message: string, fields?: FieldError[]) {
    super(message)
    this.code = code
    this.name = 'AuthError'
    this.fields = fields
  }
}
