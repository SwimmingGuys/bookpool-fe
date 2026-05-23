interface CreateStoreOptions<T> {
  storageKey?: string
  parse?: (raw: string) => T | undefined
  serialize?: (value: T) => string
}

export interface ExternalStore<T> {
  subscribe: (cb: () => void) => () => void
  getSnapshot: () => T
  get: () => T
  set: (updater: T | ((prev: T) => T)) => void
}

export function createStore<T>(
  initial: T,
  { storageKey, parse, serialize = JSON.stringify }: CreateStoreOptions<T> = {},
): ExternalStore<T> {
  const listeners = new Set<() => void>()
  const hasStorage = !!storageKey && typeof window !== 'undefined'

  function load(): T {
    if (!hasStorage) return initial
    try {
      const raw = window.localStorage.getItem(storageKey!)
      if (raw == null) return initial
      const parsed = parse ? parse(raw) : (JSON.parse(raw) as T)
      return parsed === undefined ? initial : parsed
    } catch {
      return initial
    }
  }

  let value: T = load()

  function persist() {
    if (!hasStorage) return
    try {
      window.localStorage.setItem(storageKey!, serialize(value))
    } catch {
      // ignore quota / serialization errors
    }
  }

  function emit() {
    listeners.forEach((l) => l())
  }

  function subscribe(cb: () => void) {
    listeners.add(cb)
    const onStorage = hasStorage
      ? (e: StorageEvent) => {
          if (e.key !== storageKey) return
          value = load()
          emit()
        }
      : null
    if (onStorage) window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(cb)
      if (onStorage) window.removeEventListener('storage', onStorage)
    }
  }

  function set(updater: T | ((prev: T) => T)) {
    const next =
      typeof updater === 'function' ? (updater as (p: T) => T)(value) : updater
    if (Object.is(next, value)) return
    value = next
    persist()
    emit()
  }

  return {
    subscribe,
    getSnapshot: () => value,
    get: () => value,
    set,
  }
}
