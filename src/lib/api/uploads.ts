import { apiUpload, ENDPOINTS } from '@/lib/api/client'
import { getAdminToken } from '@/lib/adminAuth'

interface UploadResponse {
  url: string
}

// 표지 이미지를 서버에 올리고 URL을 돌려받는다.
// 이전에는 data URL을 그대로 본문에 실어 보냈는데, 목록 응답마다 base64가 따라다녀
// 실제 업로드로 교체했다.
//
// 업로드는 관리자 전용 엔드포인트라, 사용자 세션이 아니라 관리자 토큰을 보낸다.
export async function uploadImage(file: File): Promise<string> {
  const { url } = await apiUpload<UploadResponse>(ENDPOINTS.uploads, file, {
    token: getAdminToken(),
  })
  return url
}
