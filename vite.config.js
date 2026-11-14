import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  css: {
    devSourcemap: true
  },
  build: {
    sourcemap: true
  }
});