import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AuthError } from '@/lib/api/auth'
import { showToast } from '@/lib/toast'
import {
  PASSWORD_MIN_LENGTH,
  validateNickname,
  validatePassword,
  validatePasswordConfirm,
} from '@/lib/authValidation'
import AuthLayout from '@/components/auth/AuthLayout'
import EmailVerificationFields from '@/components/auth/EmailVerificationFields'
import FormField from '@/components/auth/FormField'
import Button from '@/components/ui/Button'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

type Field = 'email' | 'password' | 'confirm' | 'nickname'
type Errors = Partial<Record<Field, string>>

function sanitizeRedirect(raw: string | null): string {
  if (!raw) return '/'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/'
  return raw
}

export default function SignupPage() {
  useDocumentTitle('회원가입')
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = sanitizeRedirect(searchParams.get('redirect'))

  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [nickname, setNickname] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  const setEmailError = (msg: string | undefined) =>
    setErrors((p) => ({ ...p, email: msg }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const next: Errors = {
      password: validatePassword(password),
      confirm: validatePasswordConfirm(password, confirm),
      nickname: validateNickname(nickname),
    }
    if (!emailVerified) {
      next.email = '이메일 인증을 완료해주세요.'
    }
    if (next.email || next.password || next.confirm || next.nickname) {
      setErrors((p) => ({ ...p, ...next }))
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await signup({ email, password, nickname })
      showToast('환영합니다! 회원가입이 완료되었습니다.', 'success')
      navigate(redirect, { replace: true })
    } catch (err) {
      if (err instanceof AuthError && err.code === 'EMAIL_EXISTS') {
        setErrors({ email: err.message })
        setEmailVerified(false)
      } else {
        const message =
          err instanceof AuthError
            ? err.message
            : '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
        showToast(message, 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="회원가입"
      footer={
        <>
          이미 계정이 있으신가요?{' '}
          <Link
            to={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-semibold text-orange-600 hover:text-orange-700 no-underline"
          >
            로그인
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <EmailVerificationFields
          intent="signup"
          email={email}
          setEmail={setEmail}
          emailError={errors.email}
          setEmailError={setEmailError}
          isVerified={emailVerified}
          setIsVerified={setEmailVerified}
          disabled={submitting}
        />

        <FormField
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, password: validatePassword(password) }))}
          error={errors.password}
          hint={`${PASSWORD_MIN_LENGTH}자 이상, 영문과 숫자 포함`}
          disabled={submitting}
        />

        <FormField
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호 다시 입력"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() =>
            setErrors((p) => ({
              ...p,
              confirm: validatePasswordConfirm(password, confirm),
            }))
          }
          error={errors.confirm}
          disabled={submitting}
        />

        <FormField
          label="닉네임"
          type="text"
          autoComplete="nickname"
          placeholder="2-12자"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, nickname: validateNickname(nickname) }))}
          error={errors.nickname}
          disabled={submitting}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={submitting}
          className="mt-2"
        >
          {submitting ? '가입 중...' : '가입하기'}
        </Button>
      </form>
    </AuthLayout>
  )
}
