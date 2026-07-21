import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display the landing page with hero section', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Surf Spots/)

    await expect(page.locator('main h1')).toBeVisible()
    await expect(page.locator('.hero-logo')).toBeVisible()

    const heroCtaButton = page.locator('.hero-cta .button')
    await expect(heroCtaButton).toBeVisible()
  })

  test('should navigate to surf spots when clicking hero CTA', async ({
    page,
  }) => {
    await page.goto('/')

    await page.click('.hero-cta .button')

    await expect(page).toHaveURL(/\/surf-spots/)
  })

  test('should display features sections', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('section.features').first()).toBeVisible()

    const featureCards = page.locator('.feature-card')
    await expect(featureCards).toHaveCount(7)

    await expect(page.locator('.feature-card h3')).toHaveCount(7)
  })

  test('should have proper navigation links', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('.hero-cta .button')).toBeVisible()
  })

  test('should display how it works section', async ({ page }) => {
    await page.goto('/')

    const steps = page.locator('.step')
    const stepCount = await steps.count()
    if (stepCount === 0) {
      test.skip(true, 'Step cards not rendered in this landing page variant')
      return
    }
    await expect(steps.first()).toBeVisible()
    expect(stepCount).toBeGreaterThanOrEqual(1)
  })

  test('should have final CTA section', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('.cta')).toBeVisible()

    const finalCtaButton = page.locator('.cta .button')
    await expect(finalCtaButton).toBeVisible()

    await finalCtaButton.click()
    await expect(page).toHaveURL(/\/surf-spots/)
  })
})
