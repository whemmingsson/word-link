import { defineConfig } from "vite";
import { resolve } from "path";
import { serviceWorkerPlugin } from "./vite-plugin-sw";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [serviceWorkerPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
    // Copy service worker files to dist
    copyPublicDir: true,
  },
  publicDir: "public",
});
