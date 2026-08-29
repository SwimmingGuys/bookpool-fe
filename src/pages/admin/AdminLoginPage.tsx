import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAdminAuth } from '@/lib/adminAuth'
import { AdminAuthError } from '@/lib/api/adminAuth'
import { showToast } from '@/lib/toast'
import AuthLayout from '@/components/auth/AuthLayout'
import FormField from '@/components/auth/FormField'
import Button from '@/components/ui/Button'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

function sanitizeRedirect(raw: string | null): string {
  if (!raw) return '/admin'
  if (!raw.startsWith('/admin')) return '/admin'
  return raw
}

export default function AdminLoginPage() {
  useDocumentTitle('관리자 로그인')
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = sanitizeRedirect(searchParams.get('redirect'))

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      showToast('이메일과 비밀번호를 입력해주세요.', 'warning')
      return
    }
    setSubmitting(true)
    try {
      await login({ username, password })
      showToast('관리자로 로그인되었습니다.', 'success')
      navigate(redirect, { replace: true })
    } catch (err) {
      const message =
        err instanceof AdminAuthError
          ? err.message
          : '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="관리자 로그인">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="이메일"
          autoComplete="username"
          placeholder="admin@example.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={submitting}
        />

        <FormField
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={submitting}
          className="mt-2"
        >
          {submitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    </AuthLayout>
  )
}
