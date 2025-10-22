import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { netlifyPlugin } from '@netlify/remix-adapter/plugin'

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), netlifyPlugin()],
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
