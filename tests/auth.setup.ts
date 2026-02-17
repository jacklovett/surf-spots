import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authDir = path.join(process.cwd(), 'playwright', '.auth')
const authFile = path.join(authDir, 'user.json')

setup('authenticate', async ({ page, request }) => {
  const testEmail = process.env.TEST_USER_EMAIL
  const testPassword = process.env.TEST_USER_PASSWORD
  const testName = process.env.TEST_USER_NAME || 'Test User'
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8080/api'

  if (!testEmail || !testPassword) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in your .env file for e2e tests to run. ' +
        'These are the credentials used to authenticate during tests.',
    )
  }

  // Ensure test user exists (register if needed)
  try {
    const response = await request.post(`${apiUrl}/auth/register`, {
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
    }
  } catch (error) {
    console.warn(`Could not create test user (API may not be available): ${error}`)
  }

  // Perform login via UI and capture session
  await page.goto('/auth')
  await page.waitForSelector('input[name="email"]', { state: 'visible' })

  await page.locator('input[name="email"]').fill(testEmail)
  await page.locator('input[name="password"]').fill(testPassword)

  const submitButton = page.locator('button[type="submit"]')
  await expect(submitButton).toBeEnabled({ timeout: 5000 })
  await submitButton.click()

  await page.waitForURL((url) => !url.pathname.includes('/auth'), {
    timeout: 10000,
  })

  // Wait for session to be established
  await page.waitForTimeout(1000)

  // Save authenticated state for all test projects
  fs.mkdirSync(authDir, { recursive: true })
  await page.context().storageState({ path: authFile })
})
