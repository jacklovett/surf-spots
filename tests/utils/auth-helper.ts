import { Page, expect } from '@playwright/test'

function validateTestPassword(password: string): string | null {
  if (password.length < 8) {
    return 'must be at least 8 characters long'
  }

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)
  const categories =
    (hasLower ? 1 : 0) +
    (hasUpper ? 1 : 0) +
    (hasDigit ? 1 : 0) +
    (hasSymbol ? 1 : 0)

  if (categories < 3) {
    return 'must include at least three categories: lowercase, uppercase, numbers, symbols'
  }

  return null
}

/**
 * Login helper function for e2e tests
 * Navigates to auth page and logs in with test credentials.
 * Automatically creates the test user if it doesn't exist.
 */
export async function login(page: Page) {
  const testEmail = process.env.TEST_USER_EMAIL
  const testPassword = process.env.TEST_USER_PASSWORD
  const testName = process.env.TEST_USER_NAME || 'Test User'
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8080/api'

  if (!testEmail || !testPassword) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in your .env file for e2e tests to run. ' +
      'These are the credentials used to authenticate during tests.'
    )
  }

  const passwordValidationError = validateTestPassword(testPassword)
  if (passwordValidationError) {
    throw new Error(
      `TEST_USER_PASSWORD is invalid for the current frontend validation: ${passwordValidationError}. ` +
      'Update TEST_USER_PASSWORD in .env to a compliant value (example: Test123!).',
    )
  }

  if (!apiUrl) {
    throw new Error(
      'VITE_API_URL must be set in your .env file for e2e tests to run. ' +
      'This should point to your backend API (e.g., http://localhost:8080/api)'
    )
  }

  // First, try to create the test user if it doesn't exist
  // This ensures tests work out of the box without manual setup
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
      // User already exists - verify login works with current password
      // If login fails, the password might be wrong
      console.log(`Test user already exists: ${testEmail}`)
    } else {
      // Other errors - log but continue (might be network issues)
      const errorText = await response.text().catch(() => 'Unknown error')
      console.warn(`Could not create test user (status ${response.status()}): ${errorText}`)
    }
  } catch (error) {
    // If API is not available or network error, log but continue
    // Tests might be running against a different environment
    console.warn(`Could not create test user (API may not be available): ${error}`)
  }

  // Now proceed with login
  await page.goto('/auth')

  // Wait for auth form to be visible
  await page.waitForSelector('input[name="email"]', { state: 'visible' })
  
  const emailInput = page.locator('input[name="email"]')
  const passwordInput = page.locator('input[name="password"]')
  
  // Fill inputs and trigger change events to ensure validation runs
  await emailInput.fill(testEmail)
  await emailInput.blur() // Trigger validation
  await passwordInput.fill(testPassword)
  await passwordInput.blur() // Trigger validation

  // Wait for form validation to complete and button to be enabled
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.waitFor({ state: 'visible' })
  try {
    await expect(submitButton).toBeEnabled({ timeout: 15000 })
  } catch {
    const emailError = (await page.locator('#email ~ .form-error').first().textContent().catch(() => null))?.trim()
    const passwordError = (await page.locator('#password ~ .form-error').first().textContent().catch(() => null))?.trim()
    const currentEmail = await emailInput.inputValue().catch(() => '')
    const currentPasswordLength = (await passwordInput.inputValue().catch(() => '')).length
    throw new Error(
      `Sign in button remained disabled after filling credentials. ` +
      `emailError="${emailError || ''}" passwordError="${passwordError || ''}" ` +
      `emailLength=${currentEmail.length} passwordLength=${currentPasswordLength}. ` +
      `Check TEST_USER_EMAIL/TEST_USER_PASSWORD in .env.`,
    )
  }

  // Submit form
  await submitButton.click()

  // Wait for either navigation away from auth page OR error message
  try {
    await page.waitForURL(
      (url) => !url.pathname.includes('/auth'),
      { timeout: 10000 },
    )
  } catch (error) {
    // Check if there's an error message
    const errorMessage = page.locator(
      '.error-message, [role="alert"], .submit-status, .toast--error',
    )
    const hasError = await errorMessage.isVisible().catch(() => false)
    
    if (hasError) {
      const errorText = await errorMessage.textContent()
      throw new Error(
        `Login failed: ${errorText || 'Authentication error occurred'}. ` +
        `The test user (${testEmail}) exists but login failed. ` +
        `This usually means the password in your .env file doesn't match the stored password. ` +
        `You may need to delete the existing test user from the database or update TEST_USER_PASSWORD to match. ` +
        `Make sure the backend API is running at ${apiUrl}.`,
      )
    }
    
    // If still on auth page and no error visible, check current URL
    const currentUrl = page.url()
    if (currentUrl.includes('/auth')) {
      throw new Error(
        `Login failed: Still on auth page after submission. ` +
        `The test user (${testEmail}) exists but authentication failed. ` +
        `Check that TEST_USER_PASSWORD in your .env matches the password used when the user was created. ` +
        `Make sure the backend API is running at ${apiUrl}.`,
      )
    }
    
    throw error
  }

  // Additional wait to ensure session is established
  await page.waitForTimeout(1000)
}
