/// <reference types="vite/client" />

interface ImportMetaEnv {
  // '/api'까지 포함한 백엔드 전체 주소. 미지정 시 같은 오리진의 '/api'를 쓴다.
  readonly VITE_API_BASE_URL?: string
  // Vite dev 서버가 '/api' 요청을 넘길 대상 (개발 전용)
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
