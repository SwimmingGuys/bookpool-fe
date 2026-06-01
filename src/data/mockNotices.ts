import type { Notice, NoticeCategory } from '@/types/notice'
import { TODAY_DATE, toIsoDate } from '@/lib/date'

function daysAgo(n: number): string {
  const d = new Date(TODAY_DATE)
  d.setDate(d.getDate() - n)
  return toIsoDate(d.getFullYear(), d.getMonth(), d.getDate())
}

interface NoticeSeed {
  title: string
  category: NoticeCategory
  daysAgo: number
  content: string
  isPinned?: boolean
}

const CATEGORY_AUTHORS: Record<NoticeCategory, string> = {
  update: '기술팀',
  policy: '운영팀',
  maintenance: '기술팀',
  event: '마케팅팀',
  general: '운영팀',
}

const SEEDS: NoticeSeed[] = [
  {
    title: '개인정보 처리방침 개정 안내',
    category: 'policy',
    daysAgo: 1,
    isPinned: true,
    content:
      '개인정보 처리방침이 일부 개정되었습니다.\n\n수집 항목과 보관 기간이 명확히 정리되었으며, 변경된 내용은 마이페이지 > 약관에서 확인하실 수 있습니다. 변경 사항은 공지일로부터 7일 후 효력이 발생합니다.',
  },
  {
    title: '서평단 신청 기능 업데이트',
    category: 'update',
    daysAgo: 3,
    isPinned: true,
    content:
      '서평단 신청 흐름이 개선되었습니다.\n\n이제 공고 상세 페이지에서 바로 신청하고, 마이페이지에서 신청 현황을 확인할 수 있습니다. 더 빠르고 편리하게 이용해 보세요.',
  },
  {
    title: '정기 점검 안내 (새벽 2시~4시)',
    category: 'maintenance',
    daysAgo: 5,
    content:
      '안정적인 서비스 제공을 위해 정기 점검을 진행합니다.\n\n점검 시간 동안 일부 기능 이용이 제한될 수 있습니다. 이용에 참고 부탁드립니다.',
  },
  {
    title: '봄맞이 베타리더 모집 이벤트',
    category: 'event',
    daysAgo: 6,
    content:
      '봄을 맞아 베타리더 모집 이벤트를 진행합니다.\n\n기간 내 베타리더로 선정되신 분들께 소정의 선물을 드립니다. 많은 참여 바랍니다.',
  },
  {
    title: '알림 설정 기능 추가',
    category: 'update',
    daysAgo: 8,
    content:
      '관심 카테고리와 출판사를 구독하면 새 공고가 올라올 때 알림을 받을 수 있습니다.\n\n마이페이지 > 알림 설정에서 구독 조건을 등록해 보세요.',
  },
  {
    title: '커뮤니티 이용 정책 안내',
    category: 'policy',
    daysAgo: 10,
    content:
      '건전한 커뮤니티 환경을 위한 이용 정책을 안내드립니다.\n\n부적절한 닉네임 및 게시물은 사전 통지 없이 제한될 수 있습니다.',
  },
  {
    title: '검색 성능 개선',
    category: 'update',
    daysAgo: 12,
    content: '보드 검색 속도와 정확도가 개선되었습니다. 원하는 공고를 더 빠르게 찾아보세요.',
  },
  {
    title: '신규 카테고리 추가 안내',
    category: 'general',
    daysAgo: 14,
    content:
      '학습/교육, 예술/디자인 카테고리가 새로 추가되었습니다. 다양한 분야의 도서를 만나보세요.',
  },
  {
    title: '비밀번호 보안 정책 강화',
    category: 'policy',
    daysAgo: 16,
    content:
      '계정 보호를 위해 비밀번호 정책이 강화되었습니다.\n\n비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.',
  },
  {
    title: '모바일 화면 최적화',
    category: 'update',
    daysAgo: 18,
    content: '모바일 환경에서의 레이아웃과 가독성이 개선되었습니다.',
  },
  {
    title: '서버 점검 완료 안내',
    category: 'maintenance',
    daysAgo: 20,
    content: '예정된 서버 점검이 정상적으로 완료되었습니다. 이용에 불편을 드려 죄송합니다.',
  },
  {
    title: '출간 기념 도서 증정 이벤트',
    category: 'event',
    daysAgo: 22,
    content:
      '신간 출간을 기념하여 도서 증정 이벤트를 진행합니다. 자세한 내용은 본문을 확인해 주세요.',
  },
  {
    title: '마이페이지 개편 안내',
    category: 'update',
    daysAgo: 24,
    content: '마이페이지가 계정 관리, 공고 관리, 알림 설정 탭으로 새롭게 구성되었습니다.',
  },
  {
    title: '서비스 이용약관 안내',
    category: 'policy',
    daysAgo: 26,
    content: 'BookPool 서비스 이용약관을 안내드립니다. 가입 시 약관에 동의한 것으로 간주됩니다.',
  },
  {
    title: 'BookPool 정식 오픈',
    category: 'general',
    daysAgo: 28,
    content:
      'BookPool이 정식 오픈했습니다.\n\n서평단과 베타리더를 잇는 플랫폼으로, 누구나 손쉽게 모집에 참여할 수 있습니다. 많은 이용 바랍니다.',
  },
  {
    title: '추천 공고 노출 기준 안내',
    category: 'general',
    daysAgo: 30,
    content: '홈 화면의 추천 공고는 마감 임박 및 인기도를 기준으로 선정됩니다.',
  },
]

export const mockNotices: Notice[] = SEEDS.map((seed, i) => ({
  id: `notice-${i + 1}`,
  title: seed.title,
  content: seed.content,
  category: seed.category,
  author: CATEGORY_AUTHORS[seed.category],
  isPinned: seed.isPinned ?? false,
  createdAt: daysAgo(seed.daysAgo),
}))

export function getNoticeById(id: string): Notice | undefined {
  return mockNotices.find((n) => n.id === id)
}
