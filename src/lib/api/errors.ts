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
  code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'AuthError'
  }
}
