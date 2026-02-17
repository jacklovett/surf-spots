import { test, expect } from '@playwright/test'

test.describe('Trip Planner', () => {
  test('should display trip planner page with coming soon state', async ({
    page,
  }) => {
    await page.goto('/trip-planner')

    await expect(page).toHaveURL(/\/trip-planner/)
    await expect(page.locator('h1')).toContainText('Trip Planner')
    await expect(page.locator('.chip:has-text("Coming Soon")')).toBeVisible()
  })

  test('should show how it works section', async ({ page }) => {
    await page.goto('/trip-planner')

    await expect(
      page.locator('h2:has-text("How It Works")'),
    ).toBeVisible()
    await expect(
      page.locator('text=AI-powered trip planner'),
    ).toBeVisible()
  })

  test('should show waitlist CTA when not logged in', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/trip-planner')

    await expect(
      page.locator('text=Join the waitlist for Trip Planner'),
    ).toBeVisible()
    await expect(
      page.locator('button:has-text("Create an Account")'),
    ).toBeVisible()
  })

  test('should be accessible from direct URL', async ({ page }) => {
    await page.goto('/trip-planner', { waitUntil: 'domcontentloaded' })

    await expect(page).toHaveURL(/\/trip-planner/)
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Trip Planner')
  })
})
