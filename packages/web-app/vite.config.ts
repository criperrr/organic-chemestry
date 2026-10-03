import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@quimicarush/chemistry-core': path.resolve(__dirname, '../chemistry-core/src/index.ts'),
      '@quimicarush/chemistry-dataset': path.resolve(__dirname, '../chemistry-dataset/src/index.ts'),
      '@quimicarush/gamification-engine': path.resolve(__dirname, '../gamification-engine/src/index.ts'),
      '@quimicarush/smiles-renderer': path.resolve(__dirname, '../smiles-renderer/src/index.ts'),
      '@quimicarush/molecule-canvas': path.resolve(__dirname, '../molecule-canvas/src/index.ts'),
    },
  },
  server: {
    // Listen on every interface so the dev server is reachable from other
    // machines on the LAN (e.g. testing the PWA on a phone or another laptop).
    host: true,
    port: 5173,
    strictPort: true,
  },
});
