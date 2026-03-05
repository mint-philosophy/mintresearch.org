// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://mintresearch.org',
  base: '/',
  output: 'static',
  redirects: {
    '/list': 'https://philosophyofcomputing.substack.com',
  },
  vite: {
    optimizeDeps: {
      include: ['phaser'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            phaser: ['phaser'],
          },
        },
      },
    },
  },
});
