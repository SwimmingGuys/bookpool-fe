const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_HAS_LETTER = /[A-Za-z]/
const PASSWORD_HAS_DIGIT = /\d/

export const PASSWORD_MIN_LENGTH = 8
export const NICKNAME_MIN_LENGTH = 2
export const NICKNAME_MAX_LENGTH = 12
export const VERIFICATION_CODE_LENGTH = 6
const NICKNAME_FORBIDDEN = /[<>"'`;]/
const VERIFICATION_CODE_REGEX = /^\d{6}$/

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return '이메일을 입력해주세요.'
  if (!EMAIL_REGEX.test(trimmed)) return '올바른 이메일 형식이 아닙니다.'
  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!value) return '비밀번호를 입력해주세요.'
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`
  }
  if (!PASSWORD_HAS_LETTER.test(value) || !PASSWORD_HAS_DIGIT.test(value)) {
    return '비밀번호는 영문과 숫자를 모두 포함해야 합니다.'
  }
  return undefined
}

export function validatePasswordConfirm(
  password: string,
  confirm: string,
): string | undefined {
  if (!confirm) return '비밀번호를 한 번 더 입력해주세요.'
  if (password !== confirm) return '비밀번호가 일치하지 않습니다.'
  return undefined
}

export function validateVerificationCode(value: string): string | undefined {
  if (!value) return '인증번호를 입력해주세요.'
  if (!VERIFICATION_CODE_REGEX.test(value)) {
    return `인증번호는 ${VERIFICATION_CODE_LENGTH}자리 숫자입니다.`
  }
  return undefined
}

export function validateNickname(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return '닉네임을 입력해주세요.'
  if (trimmed.length < NICKNAME_MIN_LENGTH || trimmed.length > NICKNAME_MAX_LENGTH) {
    return `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상 ${NICKNAME_MAX_LENGTH}자 이하여야 합니다.`
  }
  if (NICKNAME_FORBIDDEN.test(trimmed)) {
    return '허용되지 않는 특수문자가 포함되어 있습니다.'
  }
  return undefined
}

const CONTACT_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/

export function validateContact(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (!CONTACT_REGEX.test(trimmed.replace(/\s/g, ''))) {
    return '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)'
  }
  return undefined
}
