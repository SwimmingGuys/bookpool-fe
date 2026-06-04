import { useEffect } from 'react'

const SITE_NAME = 'BookPool'

// 라우트별 문서 제목을 설정한다. title을 주면 `${title} · BookPool`,
// 없으면 사이트명만 사용한다. (외부 시스템(document) 동기화이므로 effect가 맞다)
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  }, [title])
}
