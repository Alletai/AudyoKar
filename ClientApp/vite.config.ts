import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // não precisa de `root` nem de `import path` aqui
  base: '/',
  build: {
    outDir: '../wwwroot',
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
