import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  css: {
    preprocessorOptions: {
      scss: {
        // Enable source maps for better debugging
        sourceMap: true,
      },
    },
  },
  // Listen on all interfaces so the app on a physical device can reach the dev server at your PC's IP (e.g. 192.168.1.4:5173)
  server: {
    host: true, // same as 0.0.0.0: reachable from LAN (phone, emulator)
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
})
