import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // qualquer requisição para /api vai para o .NET
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,    
      }
    }
  }
});
