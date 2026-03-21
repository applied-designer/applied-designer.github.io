import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import generate404Plugin from './vite-plugin-generate-404';

export default defineConfig({
  plugins: [react(), generate404Plugin()],
  build: {
    outDir: './docs',
    emptyOutDir: true,
    minify: false,
    cssCodeSplit: false,
  }
});
