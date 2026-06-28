import { apiRequest } from '@/lib/api/http'
import type { NotificationSubscription } from '@/lib/notifications'

export async function getNotificationSubscription(): Promise<NotificationSubscription> {
  return apiRequest<NotificationSubscription>('/api/me/notification-subscription', {
    auth: 'user',
  })
}

export async function saveNotificationSubscription(
  subscription: NotificationSubscription,
): Promise<NotificationSubscription> {
  return apiRequest<NotificationSubscription>('/api/me/notification-subscription', {
    method: 'PUT',
    auth: 'user',
    body: subscription,
  })
}
