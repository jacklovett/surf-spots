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

    // Try to create test user if it doesn't exist
    // This ensures tests work out of the box
    const testEmail = process.env.TEST_USER_EMAIL
    const testPassword = process.env.TEST_USER_PASSWORD
    const testName = process.env.TEST_USER_NAME || 'Test User'
    const apiUrl = process.env.VITE_API_URL

    if (!apiUrl) {
      console.warn('VITE_API_URL is not set. Test user creation will be skipped.')
      return
    }

    if (!testEmail || !testPassword) {
      console.warn('TEST_USER_EMAIL or TEST_USER_PASSWORD is not set. Test user creation will be skipped.')
      return
    }

    try {
      const response = await page.request.post(`${apiUrl}/auth/register`, {
        data: {
          email: testEmail,
          password: testPassword,
          name: testName,
          provider: 'EMAIL',
        },
      })

      if (response.status() === 201) {
        console.log(`Test user created: ${testEmail}`)
      } else if (response.status() === 400 || response.status() === 409) {
        console.log(`Test user already exists: ${testEmail}`)
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.warn(`Could not create test user (status ${response.status()}): ${errorText}`)
      }
    } catch (error) {
      // API might not be available or network error - that's okay, auth-helper will handle it
      console.warn(`Could not create test user during global setup (API may not be available): ${error}`)
      console.warn('Tests will attempt to create the user during login if needed')
    }
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
