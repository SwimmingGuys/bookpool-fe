import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': '/src' },
    },
    server: {
      // /api 요청을 Spring 백엔드로 프록시해 프론트와 같은 오리진으로 묶는다.
      proxy: {
        '/api': { target: proxyTarget, changeOrigin: true },
      },
    },
  }
})
