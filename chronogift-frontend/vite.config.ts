import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // ✅ Set to root to avoid 404s on nested routes
  plugins: [react()],
})
// https://vitejs.dev/config/