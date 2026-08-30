import { useCallback, useEffect, useRef, useState } from 'react'

export type LoadStatus = 'loading' | 'success' | 'error'

export interface AsyncData<T> {
  data: T
  status: LoadStatus
  error: Error | null
  isLoading: boolean
  reload: () => void
}

interface State<T> {
  key: string
  data: T
  status: LoadStatus
  error: Error | null
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

/**
 * 페이지 단위 조회 상태(로딩·에러·재시도)를 담는 훅.
 *
 * 공유·영속 상태가 아니라 화면이 살아 있는 동안만 필요한 상태라서,
 * `lib/`의 외부 스토어 대신 로컬 상태로 둔다.
 *
 * `deps`는 JSON으로 직렬화해 비교한다. 배열·객체 필터를 매 렌더 새로 만들어 넘겨도
 * 값이 같으면 다시 조회하지 않는다.
 */
export function useAsyncData<T>(
  load: () => Promise<T>,
  initial: T,
  deps: unknown[],
): AsyncData<T> {
  const [reloadToken, setReloadToken] = useState(0)
  const requestKey = `${JSON.stringify(deps)}#${reloadToken}`

  const [state, setState] = useState<State<T>>({
    key: requestKey,
    data: initial,
    status: 'loading',
    error: null,
  })

  // 조건이 바뀌면 렌더 중에 곧바로 로딩 상태로 되돌린다.
  // effect 안에서 동기적으로 setState하면 렌더가 한 번 더 도는 걸 피하기 위함.
  // 이전 데이터는 남겨둬 새 결과가 올 때까지 화면이 비지 않게 한다.
  if (state.key !== requestKey) {
    setState((prev) => ({ ...prev, key: requestKey, status: 'loading', error: null }))
  }

  // 최신 load 함수를 참조로 들고 있어, 매 렌더 새로 만들어져도 재조회를 유발하지 않는다.
  // 렌더 중 ref를 쓰지 않도록 effect에서 갱신한다(선언 순서상 아래 effect보다 먼저 실행).
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    let cancelled = false

    loadRef
      .current()
      .then((result) => {
        if (cancelled) return
        setState({ key: requestKey, data: result, status: 'success', error: null })
      })
      .catch((err) => {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          key: requestKey,
          status: 'error',
          error: toError(err),
        }))
      })

    return () => {
      cancelled = true
    }
  }, [requestKey])

  const reload = useCallback(() => setReloadToken((n) => n + 1), [])

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    isLoading: state.status === 'loading',
    reload,
  }
}
