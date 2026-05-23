import type { Recruitment, RecruitmentType } from '@/types/recruitment'
import { CATEGORIES } from '@/types/recruitment'

const today = new Date('2026-05-23')
const TODAY_TIME = today.getTime()
const TARGET_YEAR = today.getFullYear()
const TARGET_MONTH = today.getMonth()
const DAYS_IN_MONTH = new Date(TARGET_YEAR, TARGET_MONTH + 1, 0).getDate()

function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDaysToDate(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

const TITLES_BY_CATEGORY: Record<string, string[]> = {
  'IT/개발': [
    '실무자를 위한 Spring Security',
    '모던 리액트 Deep Dive',
    '클린 아키텍처',
    'TCP/IP 네트워크 완벽 가이드',
    '도커 컨테이너 입문',
    '쿠버네티스 마스터링',
    'Go 언어 동시성 프로그래밍',
    '러스트 인 액션',
    '자바스크립트의 미래',
    '타입스크립트 핸드북',
    '데이터베이스 성능 최적화',
    'AWS 서버리스 실전',
    'Vue.js 진짜 입문',
    'Next.js 14 완벽 가이드',
    '함수형 프로그래밍 입문',
    'iOS 앱 개발의 정석',
    'Android Compose 실전',
    '백엔드 시스템 설계',
    '머신러닝 엔지니어링',
    'GraphQL 실무 가이드',
  ],
  소설: [
    '소설가의 시간',
    '마지막 편지',
    '도시의 그림자',
    '별이 빛나는 밤에',
    '시간 여행자의 일기',
    '잃어버린 도서관',
    '푸른 바다의 노래',
    '겨울이 오는 소리',
    '비밀의 정원',
    '서랍 속 이야기',
    '바람의 언덕',
    '검은 새의 비행',
  ],
  경제: [
    '디자인 씽킹과 비즈니스 전략',
    '부의 흐름을 읽는 법',
    '글로벌 경제 트렌드 2026',
    '투자의 정석',
    '거시경제학 기초',
    '행동경제학 입문',
    '돈의 심리학',
    '경제 위기의 신호',
    '스타트업 재무 가이드',
  ],
  에세이: [
    '에세이, 계속 쓰는 일',
    '혼자 사는 즐거움',
    '작은 일상의 발견',
    '여행의 기록',
    '책을 읽는다는 것',
    '느린 산책',
    '오늘도 한 줄',
    '마음의 온도',
  ],
  '기획/디자인': [
    'UX 디자인의 모든 것',
    '사용자 리서치 가이드',
    '브랜드 아이덴티티 만들기',
    '정보 설계의 기초',
    '모바일 UI 패턴',
    '프로덕트 매니지먼트 실전',
    '데이터 기반 의사결정',
    '서비스 디자인 워크북',
  ],
  자기계발: [
    '아토믹 해빗',
    '성공하는 사람들의 7가지 습관',
    '1만 시간의 법칙',
    '마인드셋',
    '그릿',
    '딥 워크',
    '도파민 디톡스',
    '하루를 바꾸는 루틴',
  ],
  '인문/사회': [
    '사피엔스: 인류의 역사',
    '총, 균, 쇠',
    '정의란 무엇인가',
    '호모 데우스',
    '인간의 조건',
    '21세기 자본',
    '문명의 충돌',
    '도시는 어떻게 만들어지는가',
  ],
  '예술/디자인': [
    '색의 인문학',
    '그래픽 디자인의 역사',
    '타이포그래피 입문',
    '일러스트레이션 가이드',
    '미니멀리즘의 미학',
    '사진 구도의 비밀',
  ],
  '학습/교육': [
    '효과적인 학습법',
    '메타인지 학습 전략',
    '어른을 위한 공부법',
    '외국어 학습의 비밀',
    '에듀테크 시대의 교실',
    '뇌과학으로 본 학습',
  ],
}

const PUBLISHERS = [
  '한빛미디어',
  '위키북스',
  '인사이트',
  '비즈니스북스',
  '김영사',
  '문학동네',
  '마음산책',
  '책만',
  '제이펍',
  '영진닷컴',
  '길벗',
  '인플루엔셜',
  '시공사',
  '민음사',
  '창비',
  '도서출판 A',
]

const DESCRIPTION_TEMPLATES = [
  '실무에서 바로 활용할 수 있는 깊이 있는 내용을 다룹니다. 솔직한 리뷰를 남겨 주세요.',
  '출간 전 마지막 검수 단계입니다. 독자의 시선에서 본 자유로운 피드백을 모집합니다.',
  '입문자도 쉽게 따라갈 수 있도록 구성한 책입니다. 다양한 독자층의 후기를 기다립니다.',
  '오랜 시간 정성을 들인 책입니다. 책장에 두고 오래 읽을 만한지 솔직한 평가 부탁드립니다.',
  '저자의 두 번째 책입니다. 이전 작과의 차이, 새로운 시도에 대한 리뷰를 환영합니다.',
]

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TYPES: RecruitmentType[] = ['Reviewer', 'Beta Reader']

function pickPoissonish(rng: () => number, mean: number): number {
  const L = Math.exp(-mean)
  let k = 0
  let p = 1
  do {
    k += 1
    p *= rng()
  } while (p > L)
  return k - 1
}

interface PlannedSlot {
  day: number
  count: number
}

function planDistribution(total: number, days: number, rng: () => number): PlannedSlot[] {
  const counts = new Array<number>(days).fill(0)
  const mean = total / days

  for (let d = 0; d < days; d++) {
    counts[d] = pickPoissonish(rng, mean)
  }

  let diff = total - counts.reduce((a, b) => a + b, 0)
  while (diff !== 0) {
    const idx = Math.floor(rng() * days)
    if (diff > 0) {
      counts[idx] += 1
      diff -= 1
    } else if (counts[idx] > 0) {
      counts[idx] -= 1
      diff += 1
    }
  }

  const maxDay = counts.reduce((acc, c, i) => (c > counts[acc] ? i : acc), 0)
  if (counts[maxDay] < 8) {
    const leastDay = counts.reduce((acc, c, i) => (c < counts[acc] ? i : acc), 0)
    const need = 8 - counts[maxDay]
    counts[maxDay] = 8
    counts[leastDay] = Math.max(0, counts[leastDay] - need)
  }

  return counts.map((count, d) => ({ day: d + 1, count }))
}

function generate(): Recruitment[] {
  const rng = mulberry32(20260523)
  const items: Recruitment[] = []
  let nextId = 1

  const slots = planDistribution(200, DAYS_IN_MONTH, rng)
  const categoryKeys = [...CATEGORIES] as string[]

  for (const slot of slots) {
    const endDate = new Date(TARGET_YEAR, TARGET_MONTH, slot.day)
    const endIso = toIso(endDate)

    for (let i = 0; i < slot.count; i++) {
      const category = categoryKeys[Math.floor(rng() * categoryKeys.length)]
      const titlePool = TITLES_BY_CATEGORY[category] ?? TITLES_BY_CATEGORY['IT/개발']
      const title = titlePool[Math.floor(rng() * titlePool.length)]
      const publisher = PUBLISHERS[Math.floor(rng() * PUBLISHERS.length)]
      const badgeLabel = TYPES[Math.floor(rng() * TYPES.length)]

      const recruitDuration = 5 + Math.floor(rng() * 10)
      const startDate = addDaysToDate(endDate, -recruitDuration)
      const announcementDate = addDaysToDate(endDate, 2 + Math.floor(rng() * 5))

      const daysRemaining = Math.round((endDate.getTime() - TODAY_TIME) / 86400000)
      const status = daysRemaining < 0 ? 'closed' : 'open'

      const description =
        DESCRIPTION_TEMPLATES[Math.floor(rng() * DESCRIPTION_TEMPLATES.length)]

      items.push({
        id: String(nextId++),
        badgeLabel,
        daysRemaining,
        title,
        bookTitle: title,
        publisher,
        category,
        viewCount: 80 + Math.floor(rng() * 3200),
        status,
        recruitStartDate: toIso(startDate),
        recruitEndDate: endIso,
        announcementDate: toIso(announcementDate),
        description,
      })
    }
  }

  return items
}

export const mockRecruitments: Recruitment[] = generate()

export function getRecruitmentById(id: string): Recruitment | undefined {
  return mockRecruitments.find((r) => r.id === id)
}
