export interface User {
  id: string
  email: string
  nickname: string
  role?: string
  // 백엔드 /me 응답엔 없는 값. 프로필 수정 등 다른 응답에서 채워질 수 있어 optional.
  contact?: string
  createdAt?: string
  // 마케팅·모집 알림 이메일 수신 동의
  emailSubscribed?: boolean
}
