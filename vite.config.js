import { defineConfig } from 'vite';

export default defineConfig({
//  base: '/wedding_website/', // замените на реальное имя вашего репозитория
  build: {
    // Never inline images/fonts as base64 — keeps the HTML small and lets the
    // browser cache heavy assets separately.
    assetsInlineLimit: 0,
  },
});