import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
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
    },
  },
  server: {
    port: 5173,
  },
});
