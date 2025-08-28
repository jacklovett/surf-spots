import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use

  // Start browser and check if the application is running
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the application to be ready with longer timeout
    await page.goto(baseURL || 'http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 60000,
    })

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle', { timeout: 30000 })

    console.log('Application is running and ready for tests')
  } catch (error) {
    console.error('Application is not running or not accessible')
    console.error('Make sure to run: npm run dev')
    console.error('Error details:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
