import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle Analyzer — generates bundle-report.html after `npm run build`
    visualizer({
      filename: 'bundle-report.html',
      open: false,      // set to true to auto-open browser on build
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into separate cacheable chunks.
        // The browser caches each chunk independently — updating app code
        // won't invalidate the vendor chunks.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Warn when any individual chunk exceeds 150KB gzipped
    chunkSizeWarningLimit: 150,
  },
})
