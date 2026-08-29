import type { RecruitmentType } from '@/types/recruitment'

// 알림을 받고 싶은 조건. 비어 있으면 알림을 받지 않는다.
export interface NotificationSubscription {
  types: RecruitmentType[]
  categories: string[]
  publishers: string[]
}

export const EMPTY_SUBSCRIPTION: NotificationSubscription = {
  types: [],
  categories: [],
  publishers: [],
}

export function isSubscriptionEmpty(sub: NotificationSubscription): boolean {
  return sub.types.length + sub.categories.length + sub.publishers.length === 0
}
