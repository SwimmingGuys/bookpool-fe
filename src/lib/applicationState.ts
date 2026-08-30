import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '@/lib/auth'
import {
  cancelApplication,
  listAppliedCampaignIds,
  markApplied,
} from '@/lib/api/applications'
import { AuthError } from '@/lib/api/errors'
import { showToast } from '@/lib/toast'

const EMPTY_APPLIED: ReadonlySet<string> = new Set()

// 사용자별 캐시. 로그인한 사람이 바뀌면 syncAppliedUser로 다시 불러온다.
let appliedUserId: string | null = null
let appliedCache: Set<string> = new Set()
let appliedLoading: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

async function refreshApplied(userId: string | null): Promise<void> {
  if (!userId) {
    appliedCache = new Set()
    emit()
    return
  }
  if (appliedLoading) return appliedLoading
  appliedLoading = listAppliedCampaignIds()
    .then((ids) => {
      appliedCache = new Set(ids)
      emit()
    })
    .catch(() => {
      // 실패해도 화면을 막지 않는다. '신청함' 표시만 빠진다.
      appliedCache = new Set()
      emit()
    })
    .finally(() => {
      appliedLoading = null
    })
  return appliedLoading
}

function syncAppliedUser(userId: string | null) {
  if (userId === appliedUserId) return
  appliedUserId = userId
  void refreshApplied(userId)
}

/** 다른 화면(마이페이지 등)에서 신청 기록을 바꿨을 때 캐시를 맞춘다. */
export function reloadAppliedCampaigns(): Promise<void> {
  return refreshApplied(appliedUserId)
}

/**
 * "이 공고에 신청했다"는 자기 신고 표시.
 *
 * 신청 자체는 외부 폼에서 이뤄지므로 서비스가 알 수 없다. 사용자가 직접 남긴 표시를
 * 기준으로 마이페이지에서 발표일·서평 마감을 챙겨준다.
 */
export function useAppliedCampaigns() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    syncAppliedUser(userId)
  }, [userId])

  const set = useSyncExternalStore(
    subscribe,
    () => appliedCache,
    () => EMPTY_APPLIED as Set<string>,
  )

  const isApplied = useCallback(
    (id: string) => user !== null && set.has(id),
    [user, set],
  )

  // 낙관적으로 반영하고 실패하면 되돌린다.
  const toggleApplied = useCallback(
    async (id: string) => {
      if (!user) {
        showToast('로그인이 필요한 서비스입니다.', 'warning')
        return
      }
      const wasApplied = appliedCache.has(id)
      const previous = appliedCache
      const next = new Set(appliedCache)
      if (wasApplied) next.delete(id)
      else next.add(id)
      appliedCache = next
      emit()

      try {
        if (wasApplied) await cancelApplication(id)
        else await markApplied(id)
      } catch (err) {
        // 이미 표시돼 있던 경우(409)는 서버 상태가 맞으므로 되돌리지 않는다.
        if (err instanceof AuthError && err.code === 'CONFLICT') return
        appliedCache = previous
        emit()
        showToast(
          err instanceof AuthError ? err.message : '신청 표시에 실패했습니다.',
          'error',
        )
      }
    },
    [user],
  )

  const appliedIds = useMemo(() => (user !== null ? [...set] : []), [user, set])

  return { appliedIds, isApplied, toggleApplied }
}
