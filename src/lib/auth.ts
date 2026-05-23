import { useSyncExternalStore } from 'react'
import { createStore } from '@/lib/createStore'

const authStore = createStore<boolean>(false, {
  storageKey: 'bookpool:auth',
  parse: (raw) => raw === '1',
  serialize: (v) => (v ? '1' : '0'),
})

export function useAuth() {
  const isLoggedIn = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    () => false,
  )
  return {
    isLoggedIn,
    login: () => authStore.set(true),
    logout: () => authStore.set(false),
  }
}
