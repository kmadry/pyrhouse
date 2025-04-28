/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    hmr: {
      overlay: false
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          /* 1. React & router – zawsze na starcie  */
          if (id.includes('node_modules/react')) return 'vendor-react'

          /* 2. MUI + emotion + popper */
          if (/node_modules\/(@mui|@emotion|@popperjs)\//.test(id))
            return 'vendor-mui'

          /* 3. Duże biblioteki ładowane warunkowo */
          if (id.includes('bwip-js'))                return 'vendor-barcodes'
          if (id.includes('canvg'))                  return 'vendor-canvg'
          if (id.match(/@react-google-maps|react-google-maps|vis\.gl\/react-google-maps/))
                                                     return 'vendor-gmaps'
          if (id.includes('html2canvas'))            return 'vendor-html2canvas'
          if (id.includes('dompurify'))              return 'vendor-dom'

          /* 4. Pozostałe node_modules – zostaw pluginowi */
          if (id.includes('node_modules'))           return null

          /* 5. Podział po folderach features/ */
          if (id.includes('src/components/features/')) {
            const [folder] = id.split('src/components/features/')[1].split('/')
            return `feature-${folder}`
          }
        }
      }
    },
    cssCodeSplit: true,
    cssTarget: 'chrome80',
    reportCompressedSize: true,
    sourcemap: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material'],
    exclude: ['@emotion/cache'],
    esbuildOptions: {
      target: 'es2015'
    }
  },
  esbuild: {
    // jsxInject: `import React from 'react'`,
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
})