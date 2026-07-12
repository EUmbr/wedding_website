import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Never inline images/fonts as base64 — keeps the HTML small and lets the
    // browser cache heavy assets separately.
    assetsInlineLimit: 0,
  },
});
