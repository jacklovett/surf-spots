import { fileURLToPath } from 'url'
import path from 'path'
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        sourceMap: true,
        loadPaths: [path.join(projectRoot, 'app')],
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
