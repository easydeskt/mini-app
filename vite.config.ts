import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    process.env.HTTPS ? mkcert() : undefined,
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-telegram': ['@telegram-apps/sdk-react'],
          'vendor-motion': ['motion'],
        },
      },
    },
  },
  publicDir: './public',
  server: {
    host: true,
    allowedHosts: true,
  },
});
