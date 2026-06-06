import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    cssInjectedByJs(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.*', 'src/**/*.stories.*'],
      rollupTypes: true,
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MonitorUI',
      formats: ['es', 'cjs'],
      fileName: (fmt) => (fmt === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        /^@gnome-ui\//,
        'monitor-api',
        /^monitor-api\//,
      ],
      output: {
        externalLiveBindings: false,
        globals: { react: 'React', 'react-dom': 'ReactDOM', 'monitor-api': 'MonitorAPI' },
      },
    },
    sourcemap: true,
    minify: false,
    target: 'es2020',
  },
});
