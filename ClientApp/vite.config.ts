// vite.config.ts (na raiz do repositório)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'ClientApp',        // tudo que for front fica em ClientApp/
  base: '/',                // para produção vai servir em "/"
  build: {
    outDir: '../wwwroot',   // gera os estáticos em wwwroot/
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
})
