import { apiRequest, ENDPOINTS, type PageResponse } from '@/lib/api/client'
import { CATEGORIES } from '@/types/recruitment'
import type {
  BookFormat,
  Category,
  DeadlineFilter,
  PublishStatus,
  Recruitment,
  RecruitmentSource,
  RecruitmentStatus,
  RecruitmentType,
  ReviewChannel,
} from '@/types/recruitment'

// ---------- 도메인 ↔ 백엔드 enum 매핑 ----------
// 백엔드는 UPPER_SNAKE_CASE enum을, 프론트는 도메인 유니온을 쓴다.
// 변환은 전부 이 파일 안에서만 일어난다.

const TYPE_TO_API: Record<RecruitmentType, string> = {
  Reviewer: 'REVIEWER',
  'Beta Reader': 'BETA_READER',
}

const TYPE_FROM_API: Record<string, RecruitmentType> = {
  REVIEWER: 'Reviewer',
  BETA_READER: 'Beta Reader',
}

const FORMAT_TO_API: Record<BookFormat, string> = {
  paper: 'PAPER',
  ebook: 'EBOOK',
  both: 'BOTH',
}

const FORMAT_FROM_API: Record<string, BookFormat> = {
  PAPER: 'paper',
  EBOOK: 'ebook',
  BOTH: 'both',
}

const CHANNEL_FROM_API: Record<string, ReviewChannel> = {
  BLOG: 'blog',
  INSTAGRAM: 'instagram',
  YES24: 'yes24',
  ALADIN: 'aladin',
  KYOBO: 'kyobo',
  BRUNCH: 'brunch',
  THREADS: 'threads',
  ETC: 'etc',
}

const SOURCE_FROM_API: Record<string, RecruitmentSource> = {
  MANUAL: 'manual',
  INSTAGRAM: 'instagram',
  BLOG: 'blog',
  PUBLISHER: 'publisher',
  ETC: 'etc',
}

// 백엔드는 카테고리를 enum 이름으로 주고받는다.
// 예전 응답(한국어 라벨)도 읽을 수 있도록 폴백 맵을 남겨 둔다.
const CATEGORY_FROM_LABEL: Record<string, Category> = {
  'IT/개발': 'IT',
  경제: 'ECONOMY',
  소설: 'NOVEL',
  에세이: 'ESSAY',
  '기획/디자인': 'PLANNING_DESIGN',
  자기계발: 'SELF_DEVELOPMENT',
  '인문/사회': 'HUMANITY',
  '예술/디자인': 'ART_DESIGN',
  '학습/교육': 'EDUCATION',
  기타: 'ETC',
}

const CATEGORY_VALUES: ReadonlySet<string> = new Set(CATEGORIES)

// 라벨이든 enum 이름이든 받아 도메인 값으로 정규화한다.
// 백엔드가 응답 형식을 enum으로 바꿔도 그대로 동작한다.
function toCategory(value: string | null | undefined): Category {
  if (!value) return 'ETC'
  const trimmed = value.trim()
  if (CATEGORY_VALUES.has(trimmed)) return trimmed as Category
  return CATEGORY_FROM_LABEL[trimmed] ?? 'ETC'
}

function toApiEnum(value: string): string {
  return value.toUpperCase()
}

// ---------- 검색 파라미터 ----------

// 백엔드 SortKey와 1:1.
export type CampaignSortKey = 'deadline' | 'popular' | 'latest'

const SORT_TO_API: Record<CampaignSortKey, string> = {
  deadline: 'DEADLINE',
  popular: 'VIEWS',
  latest: 'LATEST',
}

const DEADLINE_TO_API: Record<DeadlineFilter, string | undefined> = {
  all: undefined,
  week: 'WEEK',
  imminent: 'IMMINENT',
}

export interface CampaignSearchParams {
  query?: string
  // 출판사 정확 일치 (출판사 페이지)
  publisher?: string
  categories?: readonly Category[]
  types?: readonly RecruitmentType[]
  deadline?: DeadlineFilter
  // 캘린더가 보고 있는 달만 받아오기 위한 날짜 범위 (basis 기준일의 from~to).
  from?: string
  to?: string
  // 날짜 범위를 어떤 날짜에 적용할지 (모집 시작일 / 마감일 / 발표일)
  dateBasis?: 'recruitStart' | 'recruitEnd' | 'announcement'
  sort?: CampaignSortKey
  page?: number
  size?: number
}

const DATE_BASIS_TO_API: Record<
  NonNullable<CampaignSearchParams['dateBasis']>,
  string
> = {
  recruitStart: 'RECRUIT_START',
  recruitEnd: 'RECRUIT_END',
  announcement: 'ANNOUNCEMENT',
}

export const DEFAULT_PAGE_SIZE = 24

// ---------- 등록/수정 입력 ----------

export interface RecruitmentInput {
  title: string
  bookTitle: string
  publisher: string
  category: Category
  badgeLabel: RecruitmentType
  recruitStartDate: string
  recruitEndDate: string
  announcementDate: string
  description: string
  coverImage?: string
  applyUrl?: string
  capacity?: number
  bookFormat?: BookFormat
  reviewChannels?: ReviewChannel[]
  reviewDueDate?: string
  requirements?: string
  source: RecruitmentSource
  sourceUrl?: string
  publishStatus: PublishStatus
}

// ---------- 응답 매핑 ----------

// 공고는 신청 기록처럼 다른 응답에도 중첩돼 오므로 타입과 매퍼를 공개한다.
export interface CampaignResponse {
  id: string | number
  type?: string | null
  badgeLabel?: RecruitmentType | null
  daysRemaining?: number | null
  title: string
  bookTitle: string
  publisherName?: string | null
  publisher?: string | null
  category: string
  viewCount?: number | null
  status?: string | null
  recruitStartDate: string
  deadlineAt?: string | null
  recruitEndDate?: string | null
  announcementDate: string
  imageUrl?: string | null
  coverImage?: string | null
  description?: string | null
  applyUrl?: string | null
  capacity?: number | null
  bookFormat?: string | null
  reviewChannels?: string[] | null
  reviewDueDate?: string | null
  requirements?: string | null
  source?: string | null
  sourceUrl?: string | null
  collectedAt?: string | null
  publishStatus?: string | null
}

function toIsoDay(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : ''
}

// 마감일까지 남은 일수. 백엔드가 daysRemaining을 내려주면 그대로 쓰고,
// 없으면 오늘 기준으로 계산한다.
function resolveDaysRemaining(
  response: CampaignResponse,
  recruitEndDate: string,
): number {
  if (typeof response.daysRemaining === 'number') return response.daysRemaining
  if (!recruitEndDate) return 0
  const end = new Date(`${recruitEndDate}T23:59:59`).getTime()
  const now = Date.now()
  return Math.ceil((end - now) / 86_400_000)
}

export function toRecruitment(response: CampaignResponse): Recruitment {
  const recruitEndDate = toIsoDay(response.recruitEndDate ?? response.deadlineAt)
  const daysRemaining = resolveDaysRemaining(response, recruitEndDate)
  const badgeLabel =
    response.badgeLabel ??
    (response.type ? TYPE_FROM_API[response.type] : undefined) ??
    'Reviewer'

  return {
    id: String(response.id),
    badgeLabel,
    daysRemaining,
    title: response.title,
    bookTitle: response.bookTitle,
    publisher: response.publisherName ?? response.publisher ?? '',
    category: toCategory(response.category),
    viewCount: response.viewCount ?? 0,
    status:
      (response.status?.toLowerCase() as RecruitmentStatus | undefined) ??
      (daysRemaining < 0 ? 'closed' : 'open'),
    recruitStartDate: toIsoDay(response.recruitStartDate),
    recruitEndDate,
    announcementDate: toIsoDay(response.announcementDate),
    coverImage: response.imageUrl ?? response.coverImage ?? undefined,
    description: response.description ?? '',
    applyUrl: response.applyUrl ?? undefined,
    capacity: response.capacity ?? undefined,
    bookFormat: response.bookFormat
      ? FORMAT_FROM_API[response.bookFormat]
      : undefined,
    reviewChannels: response.reviewChannels
      ?.map((c) => CHANNEL_FROM_API[c])
      .filter((c): c is ReviewChannel => Boolean(c)),
    reviewDueDate: toIsoDay(response.reviewDueDate) || undefined,
    requirements: response.requirements ?? undefined,
    source: (response.source ? SOURCE_FROM_API[response.source] : undefined) ?? 'manual',
    sourceUrl: response.sourceUrl ?? undefined,
    collectedAt: response.collectedAt ?? undefined,
    publishStatus:
      (response.publishStatus?.toLowerCase() as PublishStatus | undefined) ??
      'published',
  }
}

function toDeadlineAt(date: string): string {
  return `${date}T23:59:59`
}

function toCampaignPayload(input: RecruitmentInput, status?: RecruitmentStatus) {
  return {
    title: input.title,
    bookTitle: input.bookTitle,
    publisherName: input.publisher,
    category: input.category,
    type: TYPE_TO_API[input.badgeLabel],
    imageUrl: input.coverImage,
    description: input.description,
    recruitStartDate: input.recruitStartDate,
    deadlineAt: toDeadlineAt(input.recruitEndDate),
    announcementDate: input.announcementDate,
    applyUrl: input.applyUrl || null,
    capacity: input.capacity ?? null,
    bookFormat: input.bookFormat ? FORMAT_TO_API[input.bookFormat] : null,
    reviewChannels: input.reviewChannels?.map(toApiEnum) ?? [],
    reviewDueDate: input.reviewDueDate || null,
    requirements: input.requirements || null,
    source: toApiEnum(input.source),
    sourceUrl: input.sourceUrl || null,
    publishStatus: toApiEnum(input.publishStatus),
    status: status ? toApiEnum(status) : undefined,
  }
}

// ---------- 공개 목록/상세 ----------

export async function listCampaigns(
  params: CampaignSearchParams = {},
): Promise<PageResponse<Recruitment>> {
  // 출판사 전용 파라미터가 없어 자유 검색어로 대신 넘긴다. 검색어와 출판사가
  // 함께 오는 화면은 없으므로 둘 중 하나만 실린다.
  const searchQuery = params.query || params.publisher || undefined

  const page = await apiRequest<PageResponse<CampaignResponse>>(ENDPOINTS.campaigns, {
    auth: false,
    query: {
      query: searchQuery,
      categories: params.categories,
      types: params.types?.map((t) => TYPE_TO_API[t]),
      deadline: params.deadline ? DEADLINE_TO_API[params.deadline] : undefined,
      from: params.from,
      to: params.to,
      dateBasis: params.dateBasis ? DATE_BASIS_TO_API[params.dateBasis] : undefined,
      sort: params.sort ? SORT_TO_API[params.sort] : undefined,
      page: params.page ?? 0,
      size: params.size ?? DEFAULT_PAGE_SIZE,
    },
  })

  const content = page.content.map(toRecruitment)
  if (!params.publisher) return { ...page, content }

  // LIKE 검색이라 '문학동네'로 '문학동네어린이'까지 딸려온다. 정확히 같은 곳만 남긴다.
  const exact = content.filter((r) => r.publisher === params.publisher)
  return { ...page, content: exact, totalElements: exact.length }
}

export async function getCampaign(id: string): Promise<Recruitment> {
  return toRecruitment(
    await apiRequest<CampaignResponse>(`${ENDPOINTS.campaigns}/${id}`, {
      auth: false,
    }),
  )
}

export async function listPublishers(): Promise<string[]> {
  return apiRequest<string[]>(ENDPOINTS.campaignPublishers, { auth: false })
}

/**
 * 홈 카테고리 타일의 '모집중 n건'.
 *
 * 백엔드가 집계 엔드포인트를 제공하므로 한 번만 호출한다.
 * 예전에는 카테고리마다 size=1로 물어봤는데, 요청이 카테고리 수만큼 나갔고
 * 목록 API에 모집중 필터가 없어 마감된 공고까지 세어졌다.
 * 서버는 게시(PUBLISHED)되고 모집중(OPEN)인 공고만 센다.
 */
export async function listCategoryCounts(): Promise<Record<string, number>> {
  const rows = await apiRequest<{ category: string; count: number }[]>(
    ENDPOINTS.campaignCategoryCounts,
    { auth: false },
  )
  return Object.fromEntries(rows.map((row) => [row.category, row.count]))
}

// ---------- 관리자 ----------

export interface AdminCampaignParams {
  publishStatus?: PublishStatus
  query?: string
  page?: number
  size?: number
}

export async function listAdminCampaigns(
  params: AdminCampaignParams = {},
  token?: string | null,
): Promise<PageResponse<Recruitment>> {
  const page = await apiRequest<PageResponse<CampaignResponse>>(
    ENDPOINTS.adminCampaigns,
    {
      token,
      query: {
        publishStatus: params.publishStatus
          ? toApiEnum(params.publishStatus)
          : undefined,
        query: params.query,
        page: params.page ?? 0,
        size: params.size ?? 100,
      },
    },
  )
  return { ...page, content: page.content.map(toRecruitment) }
}

// 백오피스 단건 조회. 공개 API(getCampaign)는 게시된 공고만 돌려주고 조회수까지 올리므로,
// 검수 대기 공고를 수정하려면 관리자 엔드포인트를 써야 한다.
export async function getAdminCampaign(
  id: string,
  token?: string | null,
): Promise<Recruitment> {
  return toRecruitment(
    await apiRequest<CampaignResponse>(`${ENDPOINTS.adminCampaigns}/${id}`, {
      token,
    }),
  )
}

export async function createAdminCampaign(
  input: RecruitmentInput,
  token?: string | null,
): Promise<Recruitment> {
  return toRecruitment(
    await apiRequest<CampaignResponse>(ENDPOINTS.adminCampaigns, {
      method: 'POST',
      token,
      body: toCampaignPayload(input),
    }),
  )
}

export async function updateAdminCampaign(
  id: string,
  input: RecruitmentInput,
  status: RecruitmentStatus | undefined,
  token?: string | null,
): Promise<Recruitment> {
  return toRecruitment(
    await apiRequest<CampaignResponse>(`${ENDPOINTS.adminCampaigns}/${id}`, {
      method: 'PUT',
      token,
      body: toCampaignPayload(input, status),
    }),
  )
}

export async function deleteAdminCampaign(
  id: string,
  token?: string | null,
): Promise<void> {
  await apiRequest<void>(`${ENDPOINTS.adminCampaigns}/${id}`, {
    method: 'DELETE',
    token,
  })
}

// 검수 큐에서 게시로 넘기거나 다시 내리는 전용 엔드포인트.
export async function setCampaignPublishStatus(
  id: string,
  publishStatus: PublishStatus,
  token?: string | null,
): Promise<Recruitment> {
  return toRecruitment(
    await apiRequest<CampaignResponse>(
      `${ENDPOINTS.adminCampaigns}/${id}/publish-status`,
      {
        method: 'PATCH',
        token,
        body: { publishStatus: toApiEnum(publishStatus) },
      },
    ),
  )
}

// 모집 상태(모집중/마감) 수동 전환.
export async function setCampaignStatus(
  id: string,
  status: RecruitmentStatus,
  token?: string | null,
): Promise<Recruitment> {
  return toRecruitment(
    await apiRequest<CampaignResponse>(`${ENDPOINTS.adminCampaigns}/${id}/status`, {
      method: 'PATCH',
      token,
      body: { status: toApiEnum(status) },
    }),
  )
}

// ---------- 즐겨찾기 / 최근 본 ----------

export async function listBookmarkedCampaignIds(): Promise<string[]> {
  const ids = await apiRequest<(number | string)[]>(ENDPOINTS.bookmarkIds)
  return ids.map(String)
}

export async function addBookmark(id: string): Promise<void> {
  await apiRequest<void>(ENDPOINTS.bookmarks, {
    method: 'POST',
    body: { campaignId: Number(id) },
  })
}

export async function removeBookmark(id: string): Promise<void> {
  await apiRequest<void>(`${ENDPOINTS.bookmarks}/${id}`, { method: 'DELETE' })
}

export async function listBookmarkedCampaigns(): Promise<Recruitment[]> {
  const page = await apiRequest<PageResponse<CampaignResponse>>(ENDPOINTS.bookmarks, {
    query: { page: 0, size: 100 },
  })
  return page.content.map(toRecruitment)
}

export async function listRecentCampaignIds(): Promise<string[]> {
  const ids = await apiRequest<(number | string)[]>(ENDPOINTS.recentViewIds, {
    query: { limit: 50 },
  })
  return ids.map(String)
}

export async function markRecentCampaign(id: string): Promise<void> {
  await apiRequest<void>(ENDPOINTS.recentViews, {
    method: 'POST',
    body: { campaignId: Number(id) },
  })
}

export async function listRecentCampaigns(): Promise<Recruitment[]> {
  const page = await apiRequest<PageResponse<CampaignResponse>>(
    ENDPOINTS.recentViews,
    { query: { page: 0, size: 50 } },
  )
  return page.content.map(toRecruitment)
}
