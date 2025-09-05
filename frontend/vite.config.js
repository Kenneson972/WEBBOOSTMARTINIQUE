import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/WEBBOOSTMARTINIQUE/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['digital-martinique-1.preview.emergentagent.com']
  },
  build: {
    outDir: 'dist'
  }
})