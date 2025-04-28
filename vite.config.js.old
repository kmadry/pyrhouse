/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: []
            }
        }),
        splitVendorChunkPlugin()
    ],
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
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    'vendor-utils': ['lodash', 'jwt-decode', 'html2canvas'],
                    'vendor-assets': ['./src/services/assetService.ts']
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
            '@emotion/react',
            '@emotion/styled',
            'lodash',
            'jwt-decode'
        ]
    }
});
