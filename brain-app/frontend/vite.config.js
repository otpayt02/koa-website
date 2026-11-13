import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.BRAIN_API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
