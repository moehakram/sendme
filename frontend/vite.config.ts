import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/sendme/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    open: true,
  },
  plugins: [tailwindcss()],
});
