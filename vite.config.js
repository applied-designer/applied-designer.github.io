import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: './docs',
    emptyOutDir: true,
    minify: false, // Disable all minification (JS + CSS)
    cssCodeSplit: false, // Keep CSS in one file
  }
})