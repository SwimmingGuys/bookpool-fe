import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'
import type { User } from '@/types/user'
import * as authApi from '@/lib/api/auth'
import { AuthError } from '@/lib/api/auth'
import { configureClient, setAccessToken } from '@/lib/api/client'

interface AuthState {
  user: User | null
  accessToken: string | null
}

const INITIAL: AuthState = { user: null, accessToken: null }

function isAuthState(value: unknown): value is AuthState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return 'user' in v && 'accessToken' in v
}

const authStore = createStore<AuthState>(INITIAL, {
  storageKey: 'bookpool:auth-v2',
  parse: (raw) => {
    try {
      const parsed = JSON.parse(raw)
      return isAuthState(parsed) ? parsed : INITIAL
    } catch {
      return INITIAL
    }
  },
})

// HTTP 클라이언트의 토큰을 영속 스토어와 동기화한다.
setAccessToken(authStore.get().accessToken)
configureClient({
  // /reissue로 받은 새 accessToken을 스토어에도 반영해 새로고침 후에도 유지한다.
  onTokenRefreshed: (token) =>
    authStore.set((prev) => ({ ...prev, accessToken: token })),
  // 재발급까지 실패하면(refresh 만료/무효) 세션을 비운다.
  onUnauthorized: () => {
    setAccessToken(null)
    authStore.set(INITIAL)
  },
})

function applyAuth(res: authApi.AuthResponse) {
  setAccessToken(res.accessToken)
  authStore.set({ user: res.user, accessToken: res.accessToken })
}

function clearAuth() {
  setAccessToken(null)
  authStore.set(INITIAL)
}

function requireAuth() {
  if (!authStore.get().user) {
    throw new AuthError('NOT_AUTHENTICATED', '로그인이 필요합니다.')
  }
}

export function useAuth() {
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    () => INITIAL,
  )
  return {
    user: state.user,
    accessToken: state.accessToken,
    isLoggedIn: state.user !== null,
    login: async (payload: authApi.LoginPayload) => {
      const res = await authApi.login(payload)
      applyAuth(res)
      return res
    },
    signup: async (payload: authApi.SignupPayload) => {
      const res = await authApi.signup(payload)
      applyAuth(res)
      return res
    },
    logout: async () => {
      try {
        await authApi.logout()
      } catch {
        // 서버 로그아웃 실패와 무관하게 클라이언트 세션은 비운다.
      }
      clearAuth()
    },
    updateProfile: async (payload: authApi.UpdateProfilePayload) => {
      requireAuth()
      const updated = await authApi.updateProfile(payload)
      authStore.set((prev) => ({ ...prev, user: updated }))
      return updated
    },
    changePassword: async (payload: authApi.ChangePasswordPayload) => {
      requireAuth()
      await authApi.changePassword(payload)
    },
  }
}
