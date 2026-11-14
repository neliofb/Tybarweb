import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'

// Catalogo custom (staff): dados e miniaturas ficam FORA do build, numa pasta servida a parte.
// Em desenvolvimento este plugin serve a pasta em /catalogo-custom; em casa quem serve e o Caddy.
const PASTA_CATALOGO = process.env.CATALOGO_CUSTOM_DIR || 'C:/Users/nelio/Documents/CatalogoCustom/site'
const TIPOS: Record<string, string> = { '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' }
function catalogoCustom(): Plugin {
  return {
    name: 'catalogo-custom',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/catalogo-custom', (req, res, next) => {
        const rel = decodeURIComponent((req.url || '/').split('?')[0])
        const arq = path.resolve(PASTA_CATALOGO, '.' + rel)
        if (!arq.startsWith(path.resolve(PASTA_CATALOGO)) || !fs.existsSync(arq) || !fs.statSync(arq).isFile()) return next()
        res.setHeader('Content-Type', TIPOS[path.extname(arq)] || 'application/octet-stream')
        fs.createReadStream(arq).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), catalogoCustom()],
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
