import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@quimicarush/chemistry-core': path.resolve(__dirname, '../chemistry-core/src/index.ts'),
      '@quimicarush/gamification-engine': path.resolve(__dirname, '../gamification-engine/src/index.ts'),
      '@quimicarush/molecule-canvas': path.resolve(__dirname, '../molecule-canvas/src/index.ts'),
    },
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
  },
});
