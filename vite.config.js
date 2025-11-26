import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 關鍵修正：確保這裡使用您的專案名稱，前後帶有斜線。
  base: '/sprint-game/',
})