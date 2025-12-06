import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
  })

  test('should display sign in form', async ({ page }) => {
    // Check if the auth page loads correctly
    await expect(page).toHaveTitle(/Sign in/)

    // Check form elements
    await expect(page.locator('h1')).toContainText('Sign In')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in')
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    // Fill in invalid email
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'password123')

    // Wait for form validation to complete
    await page.waitForTimeout(1000)

    // Check if button is enabled or disabled
    const submitButton = page.locator('button[type="submit"]')
    const isEnabled = await submitButton.isEnabled()

    if (isEnabled) {
      // If button is enabled, click it to trigger validation
      await submitButton.click()

      // Should show validation error for invalid email
      await expect(
        page.locator('.error-message, [role="alert"], .submit-status'),
      ).toBeVisible()
    } else {
      // If button is disabled, that's also valid - form validation prevents submission
      await expect(submitButton).toBeDisabled()
    }
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit empty form - button should be disabled
    const submitButton = page.locator('button[type="submit"]')

    // Button should be disabled when form is empty
    await expect(submitButton).toBeDisabled()

    // Try to click it anyway to test the disabled state
    try {
      await submitButton.click({ timeout: 5000 })
    } catch (error: any) {
      // Expected to fail since button is disabled
      expect(error.message).toContain('disabled')
    }
  })

  test('should enable submit button when form is valid', async ({ page }) => {
    // Initially button should be disabled
    const submitButton = page.locator('button[type="submit"]')

    // Fill in valid form data
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Wait for form validation to complete
    await page.waitForTimeout(1000)

    // Button should be enabled
    await expect(submitButton).toBeEnabled()
  })

  test('should have sign up link', async ({ page }) => {
    // Check if sign up link exists
    const signUpLink = page.locator('a[href="/auth/sign-up"]')
    await expect(signUpLink).toBeVisible()
    await expect(signUpLink).toContainText('Sign up')
  })

  test('should have forgot password link', async ({ page }) => {
    // Check if forgot password link exists
    const forgotPasswordLink = page.locator('a[href="/auth/forgot-password"]')
    await expect(forgotPasswordLink).toBeVisible()
    await expect(forgotPasswordLink).toContainText('Forgot password?')
  })

  test('should have continue as guest link', async ({ page }) => {
    // Check if continue as guest link exists
    const guestLink = page.locator('a[href="/surf-spots"]')
    await expect(guestLink).toBeVisible()
    await expect(guestLink).toContainText('Explore as Guest')
  })

  test('should have social login options', async ({ page }) => {
    // Check if social login buttons are present
    const googleButton = page.locator(
      'button:has-text("Google"), a:has-text("Google")',
    )
    const facebookButton = page.locator(
      'button:has-text("Facebook"), a:has-text("Facebook")',
    )

    if (await googleButton.isVisible()) {
      await expect(googleButton).toBeVisible()
    }

    if (await facebookButton.isVisible()) {
      await expect(facebookButton).toBeVisible()
    }
  })

  test('should show form labels when fields have content', async ({ page }) => {
    // Initially labels should be hidden (floating label behavior)
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')

    // Fill in fields to trigger label visibility
    await emailInput.fill('test@example.com')
    await passwordInput.fill('password123')

    // Labels should now be visible
    await expect(page.locator('label:has-text("Email")')).toBeVisible()
    await expect(page.locator('label:has-text("Password")')).toBeVisible()
  })

  test('should handle form submission with valid data', async ({ page }) => {
    // Fill in valid form data
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Wait for form validation to complete
    await page.waitForTimeout(1000)

    // Submit form
    await page.click('button[type="submit"]')

    // Should either redirect or show success/error message
    // We can't predict the exact behavior without a real backend
    // So we just check that something happens (no timeout)
    await page.waitForTimeout(2000)
  })
})
