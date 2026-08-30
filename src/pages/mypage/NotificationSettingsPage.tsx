import { useEffect, useMemo, useState } from 'react'
import { Bell, Mail, Pencil } from 'lucide-react'
import {
  categoryLabel,
  CATEGORY_OPTIONS,
  RECRUITMENT_TYPE_LABELS,
  RECRUITMENT_TYPE_OPTIONS,
  type Category,
  type RecruitmentType,
} from '@/types/recruitment'
import { listPublishers } from '@/lib/api/campaigns'
import {
  subscriptionsEqual,
  useNotificationSubscriptions,
  type NotificationSubscription,
} from '@/lib/notifications'
import { useAuth } from '@/lib/auth'
import { AuthError } from '@/lib/api/errors'
import { showToast } from '@/lib/toast'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import SearchInput from '@/components/ui/SearchInput'
import SectionCard from '@/components/ui/SectionCard'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

function toggleInArray<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

const countBadge = (count: number) =>
  count > 0 ? (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold">
      {count}
    </span>
  ) : null

export default function NotificationSettingsPage() {
  useDocumentTitle('알림 설정')
  const { user, setEmailSubscription } = useAuth()
  const { subscription: saved, save } = useNotificationSubscriptions()
  const [savingEmail, setSavingEmail] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<NotificationSubscription>(saved)
  const [publisherQuery, setPublisherQuery] = useState('')
  const [allPublishers, setAllPublishers] = useState<string[]>([])

  useEffect(() => {
    let ignore = false
    listPublishers()
      .then((publishers) => {
        if (!ignore) setAllPublishers(publishers)
      })
      .catch(() => {
        if (!ignore) setAllPublishers([])
      })
    return () => {
      ignore = true
    }
  }, [])

  const filteredPublishers = useMemo(() => {
    const q = publisherQuery.trim().toLowerCase()
    if (!q) return allPublishers
    return allPublishers.filter((p) => p.toLowerCase().includes(q))
  }, [allPublishers, publisherQuery])

  if (!user) return null

  const current = isEditing ? draft : saved
  const dirty = isEditing && !subscriptionsEqual(draft, saved)
  const totalSelections =
    current.types.length + current.categories.length + current.publishers.length

  const handleEnterEdit = () => {
    setDraft(saved)
    setIsEditing(true)
  }
  const handleCancel = () => {
    setIsEditing(false)
    setPublisherQuery('')
  }
  // 저장 실패 시 토스트는 스토어가 띄우고 값도 되돌려주므로, 여기서는 성공했을 때만
  // 편집 모드를 빠져나간다.
  const handleSave = async () => {
    try {
      await save(draft)
      setIsEditing(false)
      setPublisherQuery('')
      showToast('알림 설정이 저장되었습니다.', 'success')
    } catch {
      // 스토어에서 이미 안내했다.
    }
  }

  const handleToggleEmail = async (next: boolean) => {
    setSavingEmail(true)
    try {
      await setEmailSubscription(next)
      showToast(
        next ? '이메일 수신을 켰습니다.' : '이메일 수신을 껐습니다.',
        'success',
      )
    } catch (err) {
      showToast(
        err instanceof AuthError ? err.message : '설정 저장에 실패했습니다.',
        'error',
      )
    } finally {
      setSavingEmail(false)
    }
  }

  const handleToggleType = (type: RecruitmentType) =>
    setDraft((p) => ({ ...p, types: toggleInArray(p.types, type) }))
  const handleToggleCategory = (cat: Category) =>
    setDraft((p) => ({ ...p, categories: toggleInArray(p.categories, cat) }))
  const handleTogglePublisher = (pub: string) =>
    setDraft((p) => ({ ...p, publishers: toggleInArray(p.publishers, pub) }))

  return (
    <div>
      <p className="mb-6 text-sm text-stone-500">
        저장한 조건과 일치하는 새 공고가 등록되면 알림을 보내드려요.
      </p>

      <SummaryBanner
        totalSelections={totalSelections}
        dirty={dirty}
        isEditing={isEditing}
      />

      <div className="flex flex-col gap-6 mt-6">
        <SectionCard
          title="이메일 수신"
          description="앱 알림과 별개로, 조건에 맞는 공고를 메일로도 받을지 정합니다."
        >
          <label className="flex items-center gap-2.5 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={user.emailSubscribed ?? false}
              onChange={(e) => handleToggleEmail(e.target.checked)}
              disabled={savingEmail}
              className="h-4 w-4 rounded border-stone-300 accent-orange-500"
            />
            <Mail className="h-4 w-4 text-stone-400" />
            모집 소식 이메일 받기
          </label>
        </SectionCard>

        <SectionCard
          title="공고 종류"
          description={isEditing ? '관심 있는 공고 종류를 선택하세요.' : undefined}
          badge={countBadge(current.types.length)}
        >
          {isEditing ? (
            <ChipRow>
              {RECRUITMENT_TYPE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={draft.types.includes(opt.value)}
                  onClick={() => handleToggleType(opt.value)}
                >
                  {opt.label}
                </Chip>
              ))}
            </ChipRow>
          ) : (
            <SelectedPills
              items={saved.types.map((t) => RECRUITMENT_TYPE_LABELS[t])}
            />
          )}
        </SectionCard>

        <SectionCard
          title="카테고리"
          description={isEditing ? '관심 카테고리를 선택하세요.' : undefined}
          badge={countBadge(current.categories.length)}
        >
          {isEditing ? (
            <ChipRow>
              {CATEGORY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={draft.categories.includes(opt.value)}
                  onClick={() => handleToggleCategory(opt.value)}
                >
                  {opt.label}
                </Chip>
              ))}
            </ChipRow>
          ) : (
            <SelectedPills items={saved.categories.map(categoryLabel)} />
          )}
        </SectionCard>

        <SectionCard
          title="출판사"
          description={isEditing ? '관심 출판사를 선택하세요.' : undefined}
          badge={countBadge(current.publishers.length)}
        >
          {isEditing ? (
            <>
              <SearchInput
                value={publisherQuery}
                onChange={setPublisherQuery}
                placeholder="출판사 검색"
                variant="subtle"
                className="mb-3"
              />
              {filteredPublishers.length === 0 ? (
                <p className="mt-3 text-xs text-stone-400 text-center py-4">
                  "{publisherQuery}"에 해당하는 출판사가 없어요.
                </p>
              ) : (
                <ChipRow>
                  {filteredPublishers.map((p) => (
                    <Chip
                      key={p}
                      selected={draft.publishers.includes(p)}
                      onClick={() => handleTogglePublisher(p)}
                    >
                      {p}
                    </Chip>
                  ))}
                </ChipRow>
              )}
            </>
          ) : (
            <SelectedPills items={[...saved.publishers]} />
          )}
        </SectionCard>
      </div>

      <div className="mt-8 pt-5 border-t border-stone-200 flex justify-end gap-2">
        {!isEditing ? (
          <Button size="lg" onClick={handleEnterEdit}>
            <Pencil className="w-4 h-4" />
            수정
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="lg" onClick={handleCancel}>
              취소
            </Button>
            <Button size="lg" onClick={handleSave}>
              저장
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function SummaryBanner({
  totalSelections,
  dirty,
  isEditing,
}: {
  totalSelections: number
  dirty: boolean
  isEditing: boolean
}) {
  if (totalSelections === 0) {
    const msg = isEditing
      ? '관심 있는 항목을 선택해 주세요. 선택하지 않으면 알림이 발송되지 않아요.'
      : "아직 구독 중인 알림 조건이 없어요. 아래 '수정' 버튼을 눌러 조건을 추가하세요."
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-4 flex items-center gap-3">
        <Bell className="w-5 h-5 text-stone-400 shrink-0" />
        <p className="text-sm text-stone-500">{msg}</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-4 flex items-start gap-3">
      <Bell className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
      <p className="text-sm text-stone-700">
        총{' '}
        <span className="font-bold text-orange-600">{totalSelections}</span>
        개의 조건을 {isEditing ? '선택했어요' : '구독 중이에요'}.
        {dirty && (
          <span className="block mt-1 text-xs text-orange-600">
            저장하지 않은 변경사항이 있어요.
          </span>
        )}
      </p>
    </div>
  )
}

function SelectedPills({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-stone-400">선택된 항목이 없어요.</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>
}
