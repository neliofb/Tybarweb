import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  server: {
    // Os mocks (VITE_MOCK=1) leem o Códice e as receitas direto do repo, fora desta pasta
    fs: { allow: [path.resolve(__dirname, '..')] },
    // Em desenvolvimento, o Vite faz proxy das chamadas /api para o ServUO
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      }
    }
  }
})
