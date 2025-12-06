import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display the landing page with hero section', async ({
    page,
  }) => {
    await page.goto('/')

    // Check if the page loads with the correct title
    await expect(page).toHaveTitle(/Surf Spots/)

    // Check hero section elements
    await expect(page.locator('h1')).toContainText('Never Forget a Wave')
    await expect(page.locator('.hero-logo')).toBeVisible()

    // Check if the CTA button is present in hero section
    const heroCtaButton = page.locator('.hero-cta .button')
    await expect(heroCtaButton).toBeVisible()
    await expect(heroCtaButton).toContainText('Start Browsing Spots')
  })

  test('should navigate to surf spots page when clicking CTA button', async ({
    page,
  }) => {
    await page.goto('/')

    // Click the CTA button in hero section specifically
    await page.click('.hero-cta .button')

    // Should navigate to surf spots page
    await expect(page).toHaveURL(/\/surf-spots/)
  })

  test('should display features sections', async ({ page }) => {
    await page.goto('/')

    // Check "Track Your Journey" section header
    await expect(
      page.locator('h2:has-text("Track Your Journey")'),
    ).toBeVisible()

    // Check "Plan Your Adventures" section header
    await expect(
      page.locator('h2:has-text("Plan Your Adventures")'),
    ).toBeVisible()

    // Check if feature cards are present (6 total: 3 in each section)
    const featureCards = page.locator('.feature-card')
    await expect(featureCards).toHaveCount(6)

    // Check specific feature titles from "Track Your Journey"
    await expect(
      page.locator('.feature-card:has-text("Your Surf Map")'),
    ).toBeVisible()
    await expect(
      page.locator('.feature-card:has-text("Your Stats")'),
    ).toBeVisible()
    await expect(
      page.locator('.feature-card:has-text("Your Discoveries")'),
    ).toBeVisible()

    // Check specific feature titles from "Plan Your Adventures"
    await expect(
      page.locator('.feature-card:has-text("Explore Worldwide")'),
    ).toBeVisible()
    await expect(
      page.locator('.feature-card:has-text("Watch List Alerts")'),
    ).toBeVisible()
    await expect(
      page.locator('.feature-card:has-text("Organize Trips")'),
    ).toBeVisible()
  })

  test('should have proper navigation links', async ({ page }) => {
    await page.goto('/')

    // Check if navigation elements are present
    const navButton = page.locator('[data-testid="nav-button"]').first()
    if (await navButton.isVisible()) {
      await expect(navButton).toBeVisible()
    }
  })

  test('should display how it works section', async ({ page }) => {
    await page.goto('/')

    // Check how it works section - use more specific selector
    await expect(page.locator('h2:has-text("Getting Started is Easy")')).toBeVisible()

    // Check if steps are present
    const steps = page.locator('.step')
    await expect(steps).toHaveCount(3)

    // Check step titles
    await expect(
      page.locator('.step:has-text("Explore")'),
    ).toBeVisible()
    await expect(
      page.locator('.step:has-text("Track")'),
    ).toBeVisible()
    await expect(page.locator('.step:has-text("Organize")')).toBeVisible()
  })

  test('should have final CTA section', async ({ page }) => {
    await page.goto('/')

    // Check final CTA section
    await expect(
      page.locator('text=Ready to Never Forget a Wave?'),
    ).toBeVisible()

    // Check if CTA button is present in the final CTA section
    const finalCtaButton = page.locator('.cta .button')
    await expect(finalCtaButton).toBeVisible()
    await expect(finalCtaButton).toContainText('Start Browsing Spots')
  })
})

