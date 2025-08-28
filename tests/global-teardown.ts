import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up test environment...')

  // Add any cleanup logic here if needed
  // For example, cleaning up test data, stopping services, etc.

  console.log('✅ Test environment cleanup completed')
}

export default globalTeardown
