import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // 외부 접속 허용
    port: 5173,
    strictPort: true,  // 포트 고정 (사용중이면 오류 발생)
    allowedHosts: true,  // 모든 호스트 허용 (터널링용)
    fs: {
      strict: false,
    },
    open: 'chrome',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
