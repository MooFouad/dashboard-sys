import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Performance Configuration
 * Optimized build settings for production deployment
 */
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },

    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom'],

          // UI components library
          'ui-vendor': ['lucide-react'],

          // Utilities chunk
          'utils': ['./src/utils/performance.js'],
        },
      },
    },

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Generate source maps for production debugging
    sourcemap: false, // Set to true if you need source maps in production

    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb

    // CSS code splitting
    cssCodeSplit: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },

  // Server configuration
  server: {
    port: 5173,
    open: true,
    cors: true,
  },

  // Preview server (for production build testing)
  preview: {
    port: 4173,
    open: true,
  },
})
