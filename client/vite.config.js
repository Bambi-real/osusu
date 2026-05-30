import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
        },
      },
    },
  },

  preview: {
    port: 4173,
    strictPort: true,
  },

  server: {
    port: 5173,
    strictPort: true,
  },
});
