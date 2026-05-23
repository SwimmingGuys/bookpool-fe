import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthError, resetPassword } from '@/lib/api/auth'
import { showToast } from '@/lib/toast'
import {
  PASSWORD_MIN_LENGTH,
  validatePassword,
  validatePasswordConfirm,
} from '@/lib/authValidation'
import AuthLayout from '@/components/auth/AuthLayout'
import EmailVerificationFields from '@/components/auth/EmailVerificationFields'
import FormField from '@/components/auth/FormField'

type Field = 'email' | 'newPassword' | 'confirm'
type Errors = Partial<Record<Field | 'submit', string>>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  const setEmailError = (msg: string | undefined) =>
    setErrors((p) => ({ ...p, email: msg }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!emailVerified) {
      setErrors((p) => ({ ...p, email: '이메일 인증을 완료해주세요.' }))
      return
    }

    const next: Errors = {
      newPassword: validatePassword(newPassword),
      confirm: validatePasswordConfirm(newPassword, confirm),
    }
    if (next.newPassword || next.confirm) {
      setErrors((p) => ({ ...p, ...next }))
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await resetPassword({ email, newPassword })
      showToast('비밀번호가 변경되었습니다. 다시 로그인해주세요.', 'success')
      navigate('/login', { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        setErrors({ submit: err.message })
      } else {
        setErrors({ submit: '비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="비밀번호 찾기"
      footer={
        <>
          비밀번호가 기억나셨나요?{' '}
          <Link
            to="/login"
            className="font-semibold text-orange-600 hover:text-orange-700 no-underline"
          >
            로그인
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <EmailVerificationFields
          intent="reset"
          email={email}
          setEmail={setEmail}
          emailError={errors.email}
          setEmailError={setEmailError}
          isVerified={emailVerified}
          setIsVerified={setEmailVerified}
          disabled={submitting}
        />

        {emailVerified && (
          <>
            <FormField
              label="새 비밀번호"
              type="password"
              autoComplete="new-password"
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() =>
                setErrors((p) => ({ ...p, newPassword: validatePassword(newPassword) }))
              }
              error={errors.newPassword}
              hint={`${PASSWORD_MIN_LENGTH}자 이상, 영문과 숫자 포함`}
              disabled={submitting}
            />

            <FormField
              label="새 비밀번호 확인"
              type="password"
              autoComplete="new-password"
              placeholder="새 비밀번호 다시 입력"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() =>
                setErrors((p) => ({
                  ...p,
                  confirm: validatePasswordConfirm(newPassword, confirm),
                }))
              }
              error={errors.confirm}
              disabled={submitting}
            />
          </>
        )}

        {errors.submit && (
          <p role="alert" className="text-sm text-red-500 -mt-1">
            {errors.submit}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !emailVerified}
          className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '변경 중...' : '비밀번호 변경하기'}
        </button>
      </form>
    </AuthLayout>
  )
}
