import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
