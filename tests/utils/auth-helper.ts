import { Page } from '@playwright/test'

/**
 * Login helper function for e2e tests
 * Navigates to auth page and logs in with test credentials
 */
export async function login(page: Page) {
  await page.goto('/auth')

  // Wait for auth form to be visible
  await page.waitForSelector('input[name="email"]', { state: 'visible' })
  // TODO: Does this need to be an actual account?
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')

  // Submit form and wait for navigation away from auth page
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes('/auth'), {
      timeout: 10000,
    }),
    page.click('button[type="submit"]'),
  ])

  // Additional wait to ensure session is established
  await page.waitForTimeout(1000)
}
