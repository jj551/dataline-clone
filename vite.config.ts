import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true,
    watch: {
      usePolling: false,
      interval: 1000
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', '@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['html2canvas', 'jspdf', 'papaparse', 'xlsx'],
          'auth-vendor': ['lucide-react']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', '@tanstack/react-query'],
    exclude: ['lucide-react']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})