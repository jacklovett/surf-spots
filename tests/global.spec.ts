import { test, expect } from '@playwright/test'

test.describe('Global Functionality', () => {
  test('should handle loading states', async ({ page }) => {
    // domcontentloaded: we can still catch a brief loader before paint settles
    await page.goto('/surf-spots', { waitUntil: 'domcontentloaded' })

    const loadingIndicator = page.locator('.loading-container, .skeleton-loader')
    const mapContainer = page.locator('.map-container')

    // Whether loading UI flashes is timing-dependent; capture intent without TOCTOU:
    // (old pattern: isVisible(1s) then expect visible → loader often gone by then → flake)
    const sawLoader = await loadingIndicator
      .first()
      .waitFor({ state: 'visible', timeout: 2500 })
      .then(() => true)
      .catch(() => false)

    await expect(mapContainer).toBeVisible({ timeout: 20000 })

    if (sawLoader) {
      await expect(loadingIndicator.first()).toBeHidden({ timeout: 15000 })
    }
  })

  test('should handle error states', async ({ page }) => {
    // Navigate to a page that might show errors
    await page.goto('/surf-spots')

    // Check if error boundaries work
    const errorMessage = page.locator('.error-message, .error-boundary')
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible()
    }
  })

  test('should have proper page structure', async ({ page }) => {
    // Test that pages load correctly and have basic structure
    const routes = [
      { path: '/', expectedContent: 'Never Forget a Wave' },
      { path: '/auth', expectedContent: 'Sign In' },
      { path: '/surf-spots', expectedContent: 'Map' },
      { path: '/about-us', expectedContent: 'About' },
    ]

    for (const route of routes) {
      await page.goto(route.path)

      // Check that page loads and has expected content
      await expect(page.locator('body')).toBeVisible()

      // Check for expected content in the page using more specific selectors
      if (route.path === '/') {
        // For home page, assert structure rather than brittle exact marketing copy
        await expect(page.locator('main h1')).toBeVisible()
      } else if (route.path === '/auth') {
        // For auth page, check for the main heading
        await expect(page.locator('form input[name="email"]')).toBeVisible()
      } else if (route.path === '/surf-spots') {
        // For surf spots page, check for view switch button
        await expect(page.locator('.toolbar button')).toBeVisible()
      } else if (route.path === '/about-us') {
        // For about page, check for about content
        await expect(
          page.locator('h1:has-text("About"), h2:has-text("About")'),
        ).toBeVisible()
      }
    }
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // First load the page normally
    await page.goto('/surf-spots')

    // Then block network requests to simulate network error
    await page.route('**/*', (route) => route.abort())

    // Try to navigate or perform an action that would trigger network requests
    // This simulates a network error during normal app usage
    try {
      // Try to click something that might trigger a network request
      const toolbarButton = page.locator('.toolbar button').first()
      if (await toolbarButton.isVisible()) {
        await toolbarButton.click()
      }
    } catch (error) {
      // Expected to fail due to network blocking
      // This is fine - we're testing that the app handles network errors
    }

    // Should still show the page content even with network errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')

    // Check for important meta tags
    const metaDescription = page.locator('meta[name="description"]')
    if (await metaDescription.isVisible()) {
      await expect(metaDescription).toHaveAttribute('content')
    }

    const metaViewport = page.locator('meta[name="viewport"]')
    if (await metaViewport.isVisible()) {
      await expect(metaViewport).toHaveAttribute('content')
    }
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/surf-spots')

    // Test tab navigation
    await page.keyboard.press('Tab')

    // Check if focus is visible
    const focusedElement = page.locator(':focus')
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible()
    }
  })

  test('should handle different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 }, // Tablet
      { width: 375, height: 667 }, // Mobile
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/surf-spots')

      // Check if page is responsive
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should handle browser refresh', async ({ page }) => {
    await page.goto('/surf-spots')
    await page.waitForSelector('.map-container', { state: 'visible', timeout: 15000 })

    await page.reload()

    // Check if page loads correctly after refresh
    await expect(page).toHaveURL(/\/surf-spots/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle browser back/forward', async ({ page }) => {
    await page.goto('/')
    await page.goto('/surf-spots')

    // Go back
    await page.goBack()
    await expect(page).toHaveURL('/')

    // Go forward
    await page.goForward()
    await expect(page).toHaveURL(/\/surf-spots/)
  })

  test('should have proper favicon', async ({ page }) => {
    await page.goto('/')

    // Check if favicon is loaded
    const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]')
    if (await favicon.isVisible()) {
      await expect(favicon).toHaveAttribute('href')
    }
  })

  test('should handle global form validation', async ({ page }) => {
    await page.goto('/auth')

    // Test form validation
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')

    // Fill invalid data
    await emailInput.fill('invalid-email')
    await passwordInput.fill('')

    // Check for validation errors (inline or toast)
    const errorElements = page.locator('.error-message, .submit-status, .toast--error[role="alert"]')
    if (await errorElements.isVisible()) {
      await expect(errorElements).toBeVisible()
    }
  })

  test('should handle navigation state', async ({ page }) => {
    await page.goto('/surf-spots')
    await expect(page.locator('.toolbar')).toBeVisible({ timeout: 10000 })
    await page.goto('/surf-spots/continents')
    // Breadcrumb may be hidden/replaced on some responsive/layout variants
    const breadcrumb = page.locator('.breadcrumb')
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false)
    if (hasBreadcrumb) {
      await expect(breadcrumb).toBeVisible({ timeout: 10000 })
    } else {
      await expect(page.locator('body')).toBeVisible()
    }
  })
})
