import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // Enable source maps for better debugging
        sourceMap: true,
      },
    },
  },
  // Ensure proper file watching
  server: {
    watch: {
      usePolling: true,
    },
  },
})
