import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base is set to '/Draken/' for GitHub Pages — must match the repo name exactly.
export default defineConfig({
  plugins: [react()],
  base: '/Draken/',
})
