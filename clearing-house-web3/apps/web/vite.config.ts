import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The .env lives at the monorepo root, shared with the server. Only VITE_ keys reach the browser.
export default defineConfig({
  plugins: [react()],
  envDir: '../..',
})
