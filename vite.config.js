import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'; // For path resolution in ES modules

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { // Add resolve configuration
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // Optional: Configure proxy for API requests during development
    // to mimic Netlify redirects. This is only for `vite dev`.
    // In production, Netlify handles this with netlify.toml.
    proxy: {
      '/api': {
        target: 'http://localhost:8888/.netlify/functions', // Netlify Dev default port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist', // Ensure this matches Netlify's publish directory
  },
})