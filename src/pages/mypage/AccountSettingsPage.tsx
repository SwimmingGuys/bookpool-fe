import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { AuthError } from '@/lib/api/auth'
import { showToast } from '@/lib/toast'
import {
  PASSWORD_MIN_LENGTH,
  validateContact,
  validateNickname,
  validatePassword,
  validatePasswordConfirm,
} from '@/lib/authValidation'
import FormField from '@/components/auth/FormField'
import Button from '@/components/ui/Button'
import SectionCard from '@/components/ui/SectionCard'

type ProfileErrors = Partial<Record<'nickname' | 'contact' | 'submit', string>>
type PasswordErrors = Partial<
  Record<'currentPassword' | 'newPassword' | 'confirm' | 'submit', string>
>

export default function AccountSettingsPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <ProfileSection key={user.id} />
      <PasswordSection />
    </div>
  )
}

function ProfileSection() {
  const { user, updateProfile } = useAuth()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [contact, setContact] = useState(user?.contact ?? '')
  const [errors, setErrors] = useState<ProfileErrors>({})
  const [submitting, setSubmitting] = useState(false)

  if (!user) return null

  const dirty = nickname !== user.nickname || contact !== (user.contact ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: ProfileErrors = {
      nickname: validateNickname(nickname),
      contact: validateContact(contact),
    }
    if (next.nickname || next.contact) {
      setErrors(next)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      const updated = await updateProfile({ nickname, contact })
      setNickname(updated.nickname)
      setContact(updated.contact ?? '')
      showToast('프로필이 수정되었습니다.', 'success')
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : '프로필 수정에 실패했습니다.'
      setErrors({ submit: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionCard
      title="프로필"
      description="닉네임과 연락처를 변경할 수 있어요. 이메일은 변경할 수 없습니다."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="이메일"
          type="email"
          value={user.email}
          readOnly
          disabled
        />

        <FormField
          label="닉네임"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onBlur={() =>
            setErrors((p) => ({ ...p, nickname: validateNickname(nickname) }))
          }
          error={errors.nickname}
          disabled={submitting}
        />

        <FormField
          label="연락처"
          type="tel"
          autoComplete="tel"
          placeholder="010-1234-5678"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          onBlur={() =>
            setErrors((p) => ({ ...p, contact: validateContact(contact) }))
          }
          error={errors.contact}
          hint="선택 입력. 휴대폰 번호 형식으로 입력해주세요."
          disabled={submitting}
        />

        {errors.submit && (
          <p role="alert" className="text-sm text-red-500">
            {errors.submit}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={submitting || !dirty}>
            {submitting ? '저장 중...' : '변경사항 저장'}
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}

function PasswordSection() {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirm('')
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: PasswordErrors = {
      currentPassword: currentPassword ? undefined : '현재 비밀번호를 입력해주세요.',
      newPassword: validatePassword(newPassword),
      confirm: validatePasswordConfirm(newPassword, confirm),
    }
    if (currentPassword && currentPassword === newPassword) {
      next.newPassword = '현재 비밀번호와 다른 비밀번호를 사용해주세요.'
    }
    if (next.currentPassword || next.newPassword || next.confirm) {
      setErrors(next)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await changePassword({ currentPassword, newPassword })
      showToast('비밀번호가 변경되었습니다.', 'success')
      reset()
    } catch (err) {
      if (err instanceof AuthError && err.code === 'PASSWORD_INCORRECT') {
        setErrors({ currentPassword: err.message })
      } else if (err instanceof AuthError) {
        setErrors({ submit: err.message })
      } else {
        setErrors({ submit: '비밀번호 변경에 실패했습니다.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionCard
      title="비밀번호 변경"
      description="현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          label="현재 비밀번호"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={errors.currentPassword}
          disabled={submitting}
        />

        <FormField
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => {
            const next = e.target.value
            setNewPassword(next)
            if (confirm) {
              setErrors((p) => ({
                ...p,
                confirm: validatePasswordConfirm(next, confirm),
              }))
            }
          }}
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

        {errors.submit && (
          <p role="alert" className="text-sm text-red-500">
            {errors.submit}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}
