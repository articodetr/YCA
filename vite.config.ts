import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['stream', 'buffer', 'crypto', 'process', 'util'],
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['exceljs'],
  },
});
