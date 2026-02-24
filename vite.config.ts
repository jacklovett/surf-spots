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
  // Ensure proper file watching; listen on all interfaces so localhost (IPv4 or IPv6) works on Windows
  server: {
    host: '::', // dual-stack: reachable via localhost (127.0.0.1 and ::1)
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
})
