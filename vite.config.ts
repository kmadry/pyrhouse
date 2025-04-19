/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // Set the port to 3000
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
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React i jego ekosystem
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // Material UI i jego zależności
          if (id.includes('node_modules/@mui/material')) {
            return 'mui-core';
          }
          if (id.includes('node_modules/@mui/icons-material')) {
            return 'mui-icons';
          }
          if (id.includes('node_modules/@emotion')) {
            return 'emotion';
          }
          // Narzędzia i biblioteki pomocnicze
          if (id.includes('node_modules/lodash')) {
            return 'lodash';
          }
          if (id.includes('node_modules/date-fns')) {
            return 'date-fns';
          }
          if (id.includes('node_modules/jspdf')) {
            return 'jspdf';
          }
          if (id.includes('node_modules/bwip-js')) {
            return 'bwip-js';
          }
          // Mapy i lokalizacja
          if (id.includes('node_modules/@vis.gl') || 
              id.includes('node_modules/@react-google-maps')) {
            return 'maps-vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@mui/material', 
      '@mui/icons-material',
      'lodash',
      'date-fns',
      'jspdf',
      'bwip-js'
    ],
    exclude: ['@emotion/cache']
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
})
