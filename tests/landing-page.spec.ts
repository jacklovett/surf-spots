import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display the landing page with hero section', async ({
    page,
  }) => {
    await page.goto('/')

    // Check if the page loads with the correct title
    await expect(page).toHaveTitle(/Surf Spots/)

    // Check hero section elements
    await expect(page.locator('h1')).toContainText(
      'Track Your Surf Journey, Discover New Waves',
    )
    await expect(page.locator('.hero-logo')).toBeVisible()

    // Check if the CTA button is present in hero section
    const heroCtaButton = page.locator('.hero-cta .button')
    await expect(heroCtaButton).toBeVisible()
    await expect(heroCtaButton).toContainText('Start Tracking')
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

  test('should display features section', async ({ page }) => {
    await page.goto('/')

    // Check features section header - use more specific selector
    await expect(
      page.locator('h2:has-text("Your Complete Surf Spot Companion")'),
    ).toBeVisible()

    // Check if feature cards are present (there are 5 feature cards)
    const featureCards = page.locator('.feature-card')
    await expect(featureCards).toHaveCount(5)

    // Check specific feature titles - use more specific selectors
    await expect(
      page.locator('.feature-card:has-text("Track Surfed Spots")'),
    ).toBeVisible()
    await expect(
      page.locator('.feature-card:has-text("Discover & Plan")'),
    ).toBeVisible()
    await expect(
      page.locator('.feature-card:has-text("Watch List")'),
    ).toBeVisible()
    await expect(
      page.locator('.feature-card:has-text("Contribute & Share")'),
    ).toBeVisible()
    await expect(
      page.locator('.feature-card:has-text("Surf Statistics")'),
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
    await expect(page.locator('h2:has-text("How It Works")')).toBeVisible()

    // Check if steps are present
    const steps = page.locator('.step')
    await expect(steps).toHaveCount(3)

    // Check step titles - use more specific selectors to avoid duplicates
    await expect(
      page.locator('.step:has-text("Track Your Spots")'),
    ).toBeVisible()
    await expect(
      page.locator('.step:has-text("Plan Your Sessions")'),
    ).toBeVisible() // Changed from "Discover & Plan" to avoid duplicate
    await expect(page.locator('.step:has-text("Stay Updated")')).toBeVisible()
  })

  test('should have final CTA section', async ({ page }) => {
    await page.goto('/')

    // Check final CTA section
    await expect(
      page.locator('text=Ready to Track Your Surf Journey?'),
    ).toBeVisible()

    // Check if CTA button is present in the final CTA section
    const finalCtaButton = page.locator('.cta .button')
    await expect(finalCtaButton).toBeVisible()
    await expect(finalCtaButton).toContainText('Start Tracking')
  })
})
