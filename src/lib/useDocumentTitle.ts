import { useEffect } from 'react'

const SITE_NAME = 'BookPool'
const DEFAULT_DESCRIPTION =
  '서평단·베타리더 모집 공고를 한곳에서. 마감일 캘린더로 일정을 확인하고 관심 분야만 골라 보세요.'

// 라우트별 문서 제목을 설정한다. title을 주면 `${title} · BookPool`,
// 없으면 사이트명만 사용한다. (외부 시스템(document) 동기화이므로 effect가 맞다)
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  }, [title])
}

function setMetaTag(attr: 'property' | 'name', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function removeMetaTag(attr: 'property' | 'name', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
}

export interface PageMeta {
  title?: string
  description?: string
  image?: string
  // 'article'은 공고·공지 상세처럼 개별 문서를 가리킬 때 쓴다.
  type?: 'website' | 'article'
}

/**
 * 제목과 함께 OG/트위터 메타 태그를 갱신한다.
 * 공고 링크가 카톡·인스타로 공유될 때 미리보기가 백지로 뜨는 걸 막는다.
 *
 * CSR이라 크롤러가 실행 전 HTML만 읽으면 index.html의 기본값을 보게 된다.
 * 링크 미리보기를 정확히 맞추려면 공고 상세 경로에 서버 사이드 메타 주입이 필요하다.
 */
export function usePageMeta({ title, description, image, type = 'website' }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME
    const desc = description?.trim() || DEFAULT_DESCRIPTION
    const url = window.location.href

    document.title = fullTitle
    setMetaTag('name', 'description', desc)
    setMetaTag('property', 'og:site_name', SITE_NAME)
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:description', desc)
    setMetaTag('property', 'og:type', type)
    setMetaTag('property', 'og:url', url)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('name', 'twitter:description', desc)

    // 실제 이미지가 있을 때만 og:image를 건다.
    // 없는 기본 이미지를 가리키면 미리보기에 깨진 이미지가 뜬다.
    if (image) {
      setMetaTag('property', 'og:image', image)
      setMetaTag('name', 'twitter:image', image)
    } else {
      removeMetaTag('property', 'og:image')
      removeMetaTag('name', 'twitter:image')
    }

    setCanonical(url)
  }, [title, description, image, type])
}
