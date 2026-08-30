import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'
import { useAuth } from '@/lib/auth'
import type { Admin } from '@/types/admin'
import type { User } from '@/types/user'
import * as adminAuthApi from '@/lib/api/adminAuth'

interface AdminAuthState {
  admin: Admin | null
  accessToken: string | null
}

const INITIAL: AdminAuthState = { admin: null, accessToken: null }

const ADMIN_ROLE = 'ADMIN'

function isAdminAuthState(value: unknown): value is AdminAuthState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return 'admin' in v && 'accessToken' in v
}

const adminAuthStore = createStore<AdminAuthState>(INITIAL, {
  storageKey: 'bookpool:admin-auth',
  parse: (raw) => {
    try {
      const parsed = JSON.parse(raw)
      return isAdminAuthState(parsed) ? parsed : INITIAL
    } catch {
      return INITIAL
    }
  },
})

/**
 * 이미 관리자 계정으로 로그인한 사용자는 그 세션을 그대로 이어받는다.
 *
 * 사용자 토큰에 ADMIN 권한이 실려 있어 /api/admin/** 호출에 그대로 통한다.
 * 관리자 로그인도 결국 같은 /login을 호출하고 역할만 확인하므로, 같은 사람에게
 * 로그인을 두 번 시킬 이유가 없다.
 */
function adminFromUser(user: User | null): Admin | null {
  if (!user || user.role !== ADMIN_ROLE) return null
  return { id: user.id, username: user.email, name: user.nickname }
}

/**
 * 관리자 토큰을 React 밖에서 읽는다. 관리자용 스토어(adminRecruitments 등)가
 * apiRequest의 `token` 옵션에 실어 보내기 위해 쓴다.
 *
 * 사용자 세션을 이어받은 경우에는 일부러 null을 돌려준다. 토큰 값을 복사해 넘기면
 * `token`이 지정된 요청이 되어 401에도 /reissue 재발급을 타지 않는다. null이면
 * 클라이언트가 공용 accessToken(= 그 사용자의 토큰)을 쓰면서 재발급까지 정상 동작한다.
 */
export function getAdminToken(): string | null {
  return adminAuthStore.get().accessToken
}

export function clearAdminAuth() {
  adminAuthStore.set(INITIAL)
}

export function useAdminAuth() {
  const state = useSyncExternalStore(
    adminAuthStore.subscribe,
    adminAuthStore.getSnapshot,
    () => INITIAL,
  )
  const { user, accessToken } = useAuth()

  // 관리자 화면에서 직접 로그인한 세션이 우선이고, 없으면 사용자 세션을 이어받는다.
  const linkedAdmin = state.admin === null ? adminFromUser(user) : null
  const admin = state.admin ?? linkedAdmin

  return {
    admin,
    accessToken: state.accessToken ?? (linkedAdmin ? accessToken : null),
    isAdminLoggedIn: admin !== null,
    // 사용자 세션을 이어받은 상태인지. 이 경우 백오피스에서 '로그아웃'할 대상이 없다.
    linkedToUserSession: linkedAdmin !== null,
    login: async (payload: adminAuthApi.AdminLoginPayload) => {
      const res = await adminAuthApi.login(payload)
      adminAuthStore.set({ admin: res.admin, accessToken: res.accessToken })
      return res
    },
    logout: () => {
      clearAdminAuth()
    },
  }
}
