import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'
import type { Admin } from '@/types/admin'
import * as adminAuthApi from '@/lib/api/adminAuth'

interface AdminAuthState {
  admin: Admin | null
  accessToken: string | null
}

const INITIAL: AdminAuthState = { admin: null, accessToken: null }

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
 * 관리자 토큰을 React 밖에서 읽는다. 관리자용 스토어(adminRecruitments 등)가
 * apiRequest의 `token` 옵션에 실어 보내기 위해 쓴다.
 * 일반 사용자 세션(client.ts의 accessToken)과는 완전히 분리돼 있다.
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
  return {
    admin: state.admin,
    accessToken: state.accessToken,
    isAdminLoggedIn: state.admin !== null,
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
