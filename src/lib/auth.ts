import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'
import type { User } from '@/types/user'
import * as authApi from '@/lib/api/auth'

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
      authStore.set({ user: res.user, accessToken: res.accessToken })
      return res
    },
    signup: async (payload: authApi.SignupPayload) => {
      const res = await authApi.signup(payload)
      authStore.set({ user: res.user, accessToken: res.accessToken })
      return res
    },
    logout: () => {
      authStore.set(INITIAL)
    },
  }
}
