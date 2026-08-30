export type RecruitmentType = 'Reviewer' | 'Beta Reader'

export type RecruitmentStatus = 'open' | 'closed'

// 마감 조건 필터. 백엔드 DeadlineFilter(ALL/WEEK/IMMINENT)와 1:1이다.
export type DeadlineFilter = 'all' | 'week' | 'imminent'

export const RECRUITMENT_TYPE_LABELS: Record<RecruitmentType, string> = {
  Reviewer: '서평단',
  'Beta Reader': '베타리더',
}

export const RECRUITMENT_TYPE_OPTIONS: { value: RecruitmentType; label: string }[] = [
  { value: 'Reviewer', label: RECRUITMENT_TYPE_LABELS.Reviewer },
  { value: 'Beta Reader', label: RECRUITMENT_TYPE_LABELS['Beta Reader'] },
]

// 값 공간은 백엔드 CampaignCategory와 1:1이다. 예전엔 한국어 라벨을 그대로 값으로 써서
// 필터 쿼리(`categories=IT/개발`)가 서버에서 enum 변환에 실패했다.
// 화면에 보이는 문구는 CATEGORY_LABELS로만 만든다.
export const CATEGORIES = [
  'IT',
  'NOVEL',
  'ECONOMY',
  'ESSAY',
  'PLANNING_DESIGN',
  'SELF_DEVELOPMENT',
  'HUMANITY',
  'ART_DESIGN',
  'EDUCATION',
  'ETC',
] as const

export type Category = (typeof CATEGORIES)[number]

// 라벨 문구는 백엔드 CampaignCategory의 label과 맞춰 둔다.
export const CATEGORY_LABELS: Record<Category, string> = {
  IT: 'IT/개발',
  NOVEL: '소설',
  ECONOMY: '경제',
  ESSAY: '에세이',
  PLANNING_DESIGN: '기획/디자인',
  SELF_DEVELOPMENT: '자기계발',
  HUMANITY: '인문/사회',
  ART_DESIGN: '예술/디자인',
  EDUCATION: '학습/교육',
  ETC: '기타',
}

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = CATEGORIES.map(
  (value) => ({ value, label: CATEGORY_LABELS[value] }),
)

export function categoryLabel(value: Category | string): string {
  return CATEGORY_LABELS[value as Category] ?? value
}

// ---------- 모집 조건 ----------

// 제공 도서 형태
export type BookFormat = 'paper' | 'ebook' | 'both'

export const BOOK_FORMAT_LABELS: Record<BookFormat, string> = {
  paper: '종이책',
  ebook: 'eBook',
  both: '종이책 + eBook',
}

export const BOOK_FORMAT_OPTIONS: { value: BookFormat; label: string }[] = [
  { value: 'paper', label: BOOK_FORMAT_LABELS.paper },
  { value: 'ebook', label: BOOK_FORMAT_LABELS.ebook },
  { value: 'both', label: BOOK_FORMAT_LABELS.both },
]

// 서평을 올려야 하는 채널. 분쟁이 잦은 항목이라 공고에 명시한다.
export type ReviewChannel =
  | 'blog'
  | 'instagram'
  | 'yes24'
  | 'aladin'
  | 'kyobo'
  | 'brunch'
  | 'threads'
  | 'etc'

export const REVIEW_CHANNEL_LABELS: Record<ReviewChannel, string> = {
  blog: '블로그',
  instagram: '인스타그램',
  yes24: '예스24',
  aladin: '알라딘',
  kyobo: '교보문고',
  brunch: '브런치',
  threads: '스레드',
  etc: '기타',
}

export const REVIEW_CHANNEL_OPTIONS: { value: ReviewChannel; label: string }[] = (
  Object.keys(REVIEW_CHANNEL_LABELS) as ReviewChannel[]
).map((value) => ({ value, label: REVIEW_CHANNEL_LABELS[value] }))

// ---------- 수집 출처 (크롤링 대비) ----------

// 공고가 어디서 왔는지. 지금은 전부 'manual'이지만, 크롤러가 붙으면 그대로 확장된다.
export type RecruitmentSource = 'manual' | 'instagram' | 'blog' | 'publisher' | 'etc'

export const RECRUITMENT_SOURCE_LABELS: Record<RecruitmentSource, string> = {
  manual: '직접 등록',
  instagram: '인스타그램',
  blog: '블로그',
  publisher: '출판사',
  etc: '기타',
}

export const RECRUITMENT_SOURCE_OPTIONS: { value: RecruitmentSource; label: string }[] = (
  Object.keys(RECRUITMENT_SOURCE_LABELS) as RecruitmentSource[]
).map((value) => ({ value, label: RECRUITMENT_SOURCE_LABELS[value] }))

// 게시 상태. 크롤러가 수집한 공고는 'draft'로 들어와 관리자 검수를 거쳐 'published'가 된다.
export type PublishStatus = 'draft' | 'published'

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  draft: '검수 대기',
  published: '게시됨',
}

export interface Recruitment {
  id: string
  badgeLabel: RecruitmentType
  daysRemaining: number
  title: string
  bookTitle: string
  publisher: string
  category: Category
  viewCount: number
  status: RecruitmentStatus
  recruitStartDate: string
  recruitEndDate: string
  announcementDate: string
  coverImage?: string
  description: string
  // 신청 페이지(구글폼·출판사 페이지 등). 없으면 상세에서 신청 버튼을 비활성화한다.
  applyUrl?: string
  // 모집 조건
  capacity?: number
  bookFormat?: BookFormat
  reviewChannels?: ReviewChannel[]
  reviewDueDate?: string
  requirements?: string
  // 수집 출처
  source: RecruitmentSource
  sourceUrl?: string
  collectedAt?: string
  publishStatus: PublishStatus
}

// 같은 공고가 여러 소스에서 수집될 때 중복을 걸러내기 위한 키.
// 도서명 + 출판사 + 마감일이 같으면 같은 모집으로 본다.
export function recruitmentDedupeKey(
  r: Pick<Recruitment, 'bookTitle' | 'publisher' | 'recruitEndDate'>,
): string {
  const normalize = (v: string) => v.trim().toLowerCase().replace(/\s+/g, '')
  return `${normalize(r.bookTitle)}|${normalize(r.publisher)}|${r.recruitEndDate}`
}
