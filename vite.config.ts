import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Custom plugin to copy public files with filtering
function copyPublicPlugin() {
  return {
    name: 'copy-public-filtered',
    closeBundle() {
      const publicDir = 'public';
      const outDir = 'dist';

      function copyRecursive(src: string, dest: string) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }

        const entries = readdirSync(src);

        for (const entry of entries) {
          const srcPath = join(src, entry);
          const destPath = join(dest, entry);

          // Skip the corrupted file
          if (entry === 'image copy.png') {
            continue;
          }

          try {
            if (statSync(srcPath).isDirectory()) {
              copyRecursive(srcPath, destPath);
            } else {
              copyFileSync(srcPath, destPath);
            }
          } catch (err) {
            console.warn(`Warning: Could not copy ${srcPath}`);
          }
        }
      }

      copyRecursive(publicDir, outDir);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyPublicPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: false, // Disable default public dir copying
});
