import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  AuthError,
  sendVerificationCode,
  verifyCode,
  verifyResetCode,
  type VerificationIntent,
} from '@/lib/api/auth'
import {
  VERIFICATION_CODE_LENGTH,
  validateEmail,
  validateVerificationCode,
} from '@/lib/authValidation'
import { showToast } from '@/lib/toast'

interface EmailVerificationFieldsProps {
  intent: VerificationIntent
  email: string
  setEmail: (next: string) => void
  emailError: string | undefined
  setEmailError: (msg: string | undefined) => void
  isVerified: boolean
  setIsVerified: (verified: boolean) => void
  disabled?: boolean
}

const inputBase =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all focus:ring-4 disabled:bg-stone-50 disabled:text-stone-500'

const inputNormal =
  'border-stone-200 focus:border-orange-400 focus:ring-orange-100'

const inputError = 'border-red-300 focus:border-red-400 focus:ring-red-100'

const sideButton =
  'shrink-0 px-3.5 rounded-lg bg-stone-800 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap'

export default function EmailVerificationFields({
  intent,
  email,
  setEmail,
  emailError,
  setEmailError,
  isVerified,
  setIsVerified,
  disabled,
}: EmailVerificationFieldsProps) {
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [codeError, setCodeError] = useState<string | undefined>()

  const resetVerificationState = () => {
    setCodeSent(false)
    setIsVerified(false)
    setCode('')
    setCodeError(undefined)
  }

  const handleEmailChange = (next: string) => {
    setEmail(next)
    if (codeSent || isVerified) resetVerificationState()
  }

  const handleSendCode = async () => {
    const err = validateEmail(email)
    if (err) {
      setEmailError(err)
      return
    }
    setEmailError(undefined)
    setSendingCode(true)
    try {
      await sendVerificationCode(email, { intent })
      setCode('')
      setCodeError(undefined)
      setCodeSent(true)
      showToast('인증번호를 발송했습니다. 메일함을 확인해주세요.', 'info')
    } catch (e) {
      if (e instanceof AuthError) setEmailError(e.message)
      else setEmailError('인증번호 발송에 실패했습니다.')
    } finally {
      setSendingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    const err = validateVerificationCode(code)
    if (err) {
      setCodeError(err)
      return
    }
    setCodeError(undefined)
    setVerifyingCode(true)
    try {
      if (intent === 'reset') await verifyResetCode(email, code)
      else await verifyCode(email, code)
      setIsVerified(true)
      showToast('이메일이 인증되었습니다.', 'success')
    } catch (e) {
      if (e instanceof AuthError) setCodeError(e.message)
      else setCodeError('인증에 실패했습니다.')
    } finally {
      setVerifyingCode(false)
    }
  }

  const emailLocked = isVerified || sendingCode || disabled
  const codeLocked = isVerified || verifyingCode || disabled

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-stone-700">
          이메일
        </label>
        <div className="flex gap-2">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={() => setEmailError(validateEmail(email))}
            disabled={emailLocked}
            aria-invalid={emailError ? true : undefined}
            className={cn(inputBase, emailError ? inputError : inputNormal)}
          />
          <button
            type="button"
            onClick={handleSendCode}
            disabled={emailLocked}
            className={sideButton}
          >
            {sendingCode ? '발송 중' : codeSent ? '재발송' : '인증번호 발송'}
          </button>
        </div>
        {emailError ? (
          <p className="text-xs text-red-500">{emailError}</p>
        ) : isVerified ? (
          <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            이메일이 인증되었습니다.
          </p>
        ) : null}
      </div>

      {codeSent && !isVerified && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code" className="text-sm font-semibold text-stone-700">
            인증번호
          </label>
          <div className="flex gap-2">
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={`${VERIFICATION_CODE_LENGTH}자리 숫자`}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, VERIFICATION_CODE_LENGTH))
              }
              disabled={codeLocked}
              maxLength={VERIFICATION_CODE_LENGTH}
              aria-invalid={codeError ? true : undefined}
              className={cn(inputBase, 'tabular-nums', codeError ? inputError : inputNormal)}
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={codeLocked}
              className={sideButton}
            >
              {verifyingCode ? '확인 중' : '확인'}
            </button>
          </div>
          {codeError && <p className="text-xs text-red-500">{codeError}</p>}
        </div>
      )}
    </>
  )
}
