import { apiUpload, ENDPOINTS } from '@/lib/api/client'

interface UploadResponse {
  url: string
}

// 표지 이미지를 서버에 올리고 URL을 돌려받는다.
// 이전에는 data URL을 그대로 본문에 실어 보냈는데, 목록 응답마다 base64가 따라다녀
// 실제 업로드로 교체했다.
export async function uploadImage(file: File): Promise<string> {
  const { url } = await apiUpload<UploadResponse>(ENDPOINTS.uploads, file)
  return url
}
