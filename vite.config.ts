/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Set the port to 3000
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
