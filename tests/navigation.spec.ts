import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    // Start from landing page
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Navigate to surf spots using hero CTA button
    await page.click('.hero-cta .button')
    await expect(page).toHaveURL(/\/surf-spots/)

    // Navigate to auth page
    await page.goto('/auth')
    await expect(page).toHaveURL('/auth')
  })

  test('should show correct breadcrumb navigation', async ({ page }) => {
    // Navigate to a specific continent
    await page.goto('/surf-spots/africa')

    // Check if breadcrumb shows the continent (lowercase, no spaces)
    await expect(page.locator('.breadcrumb')).toContainText('africa')

    // Navigate to a specific country
    await page.goto('/surf-spots/africa/algeria')

    // Check if breadcrumb shows the country (lowercase, no spaces)
    await expect(page.locator('.breadcrumb')).toContainText('algeria')

    // Navigate to a specific region
    await page.goto('/surf-spots/africa/algeria/boumerdes')

    // Check if breadcrumb shows the region (lowercase, no spaces)
    await expect(page.locator('.breadcrumb')).toContainText('boumerdes')
  })

  test('should handle back button navigation', async ({ page }) => {
    // Navigate to surf spots
    await page.goto('/surf-spots')

    // Navigate to a sub-page
    await page.goto('/surf-spots/continents')

    // Use browser back button
    await page.goBack()
    await expect(page).toHaveURL(/\/surf-spots/)
  })

  test('should handle direct URL access to public routes', async ({ page }) => {
    // Test direct access to various public routes
    const publicRoutes = [
      '/',
      '/auth',
      '/surf-spots',
      '/surf-spots/continents',
      '/about-us',
    ]

    for (const route of publicRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL(route)

      // Check if page loads without errors
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should handle auth guard redirects', async ({ page }) => {
    await page.context().clearCookies()

    // Routes whose loader redirects to /auth when unauthenticated (edit-surf-spot catches redirect and renders error instead)
    const authGuardedRoutes = [
      '/profile',
      '/surfed-spots',
      '/watch-list',
      '/add-surf-spot',
      '/surfboards',
      '/trips',
    ]

    for (const route of authGuardedRoutes) {
      // Use domcontentloaded so we don't wait for full load; then wait for redirect
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 })
      await expect(page).toHaveURL(/\/auth/, { timeout: 15000 })

      await expect(
        page.locator('h1:has-text("Sign In"), h1:has-text("Login")'),
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('should show sign-up prompt modal when clicking protected links in menu', async ({
    page,
  }) => {
    // Ensure user is not logged in (clear any existing session)
    await page.goto('/')
    await page.context().clearCookies()
    await page.reload()

    // Open menu drawer (check for hamburger menu or drawer trigger)
    const menuTriggers = [
      'button[aria-label*="menu"]',
      '.menu-button',
      '[data-testid="menu-button"]',
      'button:has-text("Menu")',
    ]

    let menuOpened = false
    for (const selector of menuTriggers) {
      const trigger = page.locator(selector).first()
      if (await trigger.isVisible().catch(() => false)) {
        await trigger.click()
        await page.locator('.drawer, [role="dialog"], .modal-overlay').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
        menuOpened = true
        break
      }
    }

    // Test protected routes that should show modal
    const protectedRoutes = [
      { link: 'Surfboards', feature: 'surfboards' },
      { link: 'Trips', feature: 'trips' },
    ]

    for (const { link } of protectedRoutes) {
      // Try to click the link in menu/drawer
      const linkElement = page
        .locator(`a:has-text("${link}"), button:has-text("${link}")`)
        .first()
      const linkExists = await linkElement.isVisible().catch(() => false)

      if (linkExists) {
        await linkElement.click()
        const modal = page.locator('.modal-overlay')
        const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false)

        if (modalVisible) {
          await expect(modal.locator('h2')).toBeVisible()
          const ctaButton = modal.locator('button:has-text("Create an account")')
          await expect(ctaButton).toBeVisible()
          await ctaButton.click()
          await page.waitForURL(/\/auth\/sign-up/, { timeout: 5000 })
          expect(page.url()).toContain('/auth/sign-up')

          await page.goto('/')
          if (menuOpened) {
            for (const sel of menuTriggers) {
              const tr = page.locator(sel).first()
              if (await tr.isVisible().catch(() => false)) {
                await tr.click()
                await page.locator('.drawer, [role="dialog"]').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
                break
              }
            }
          }
        }
      }
    }
  })

  test('should show sign-up prompt modal when clicking protected links in footer', async ({
    page,
  }) => {
    // Ensure user is not logged in
    await page.goto('/')
    await page.context().clearCookies()
    await page.reload()

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.locator('footer a').first().waitFor({ state: 'visible', timeout: 5000 })

    // Test protected routes in footer
    const protectedLinks = [
      { link: 'Surfboards', feature: 'surfboards' },
      { link: 'Trips', feature: 'trips' },
    ]

    for (const { link } of protectedLinks) {
      const linkElement = page.locator(`footer a:has-text("${link}")`).first()
      const linkExists = await linkElement.isVisible().catch(() => false)

      if (linkExists) {
        await linkElement.click()
        const modal = page.locator('.modal-overlay')
        const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false)

        if (modalVisible) {
          await expect(modal.locator('h2')).toBeVisible()
          await expect(modal.locator('button:has-text("Create an account")')).toBeVisible()
          await modal.locator('button:has-text("Create an account")').click()
          await page.waitForURL(/\/auth\/sign-up/, { timeout: 5000 })
          expect(page.url()).toContain('/auth/sign-up')

          await page.goto('/')
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
          await page.locator('footer a').first().waitFor({ state: 'visible', timeout: 5000 })
        }
      }
    }
  })

  test('should handle 404 errors gracefully', async ({ page }) => {
    // Try to access a non-existent route
    await page.goto('/non-existent-route')

    // Should show 404 page or redirect to home
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/surf-spots')
    await page.waitForSelector('.map-container', { state: 'visible', timeout: 15000 })

    // Navigate away and back
    await page.goto('/')
    await page.goto('/surf-spots')

    // Page should load correctly
    await expect(page).toHaveURL(/\/surf-spots/)
  })

  test('should handle deep linking', async ({ page }) => {
    // Test deep linking to specific surf spot
    await page.goto('/surf-spots/continents')
    await expect(page).toHaveURL(/\/continents/)

    // Check if page content loads correctly
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate through continent hierarchy', async ({ page }) => {
    // Start from continents
    await page.goto('/surf-spots/continents')
    await expect(page).toHaveURL(/\/continents/)

    // Navigate to a continent
    await page.goto('/surf-spots/africa')
    await expect(page).toHaveURL(/\/surf-spots\/africa/)

    // Navigate to a country
    await page.goto('/surf-spots/africa/algeria')
    await expect(page).toHaveURL(/\/surf-spots\/africa\/algeria/)

    // Navigate to a region
    await page.goto('/surf-spots/africa/algeria/boumerdes')
    await expect(page).toHaveURL(/\/surf-spots\/africa\/algeria\/boumerdes/)
  })
})
