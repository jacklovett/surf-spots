import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    // Pure unit tests only for now (no React Testing Library setup yet).
    include: ['app/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/tests/**'],
  },
})
