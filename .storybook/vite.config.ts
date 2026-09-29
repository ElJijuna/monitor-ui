import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Storybook supplies its React plugin; library publishing plugins belong in the root config.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    },
  },
});
