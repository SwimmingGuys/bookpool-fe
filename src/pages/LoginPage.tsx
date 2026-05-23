import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AuthError } from '@/lib/api/auth'
import { showToast } from '@/lib/toast'
import { validateEmail, validatePassword } from '@/lib/authValidation'
import AuthLayout from '@/components/auth/AuthLayout'
import FormField from '@/components/auth/FormField'

type Field = 'email' | 'password'
type Errors = Partial<Record<Field | 'submit', string>>

function sanitizeRedirect(raw: string | null): string {
  if (!raw) return '/'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/'
  return raw
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = sanitizeRedirect(searchParams.get('redirect'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  const validateAll = (): Errors => ({
    email: validateEmail(email),
    password: validatePassword(password),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = validateAll()
    if (next.email || next.password) {
      setErrors(next)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await login({ email, password })
      showToast('로그인되었습니다.', 'success')
      navigate(redirect, { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        setErrors({ submit: err.message })
      } else {
        setErrors({ submit: '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="로그인"
      footer={
        <>
          회원가입이 필요하신가요?{' '}
          <Link
            to={`/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-semibold text-orange-600 hover:text-orange-700 no-underline"
          >
            회원가입
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="이메일"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, email: validateEmail(email) }))}
          error={errors.email}
          disabled={submitting}
        />

        <FormField
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, password: validatePassword(password) }))}
          error={errors.password}
          disabled={submitting}
        />

        <div className="-mt-1 text-right">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-stone-500 hover:text-orange-600 no-underline"
          >
            비밀번호를 잊어버리셨나요?
          </Link>
        </div>

        {errors.submit && (
          <p role="alert" className="text-sm text-red-500 -mt-1">
            {errors.submit}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </AuthLayout>
  )
}
