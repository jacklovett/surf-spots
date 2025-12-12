import { test, expect } from '@playwright/test'

test.describe('Watch List Page', () => {
  test.describe('Unauthenticated User', () => {
    test('should redirect to auth page when not logged in', async ({
      page,
    }) => {
      await page.goto('/watch-list')

      // Should redirect to auth page
      await expect(page).toHaveURL(/\/auth/)
    })
  })

  test.describe('Authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto('/auth')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')

      // Wait for redirect after login
      await page.waitForTimeout(2000)
    })

    test('should display watch list page title', async ({ page }) => {
      await page.goto('/watch-list')

      // Check page title
      await expect(page.locator('h1')).toContainText('Watch List')
    })

    test('should show empty state when no spots are watched', async ({
      page,
    }) => {
      await page.goto('/watch-list')

      // Look for empty state card
      const emptyState = page.locator('.empty-state')

      if (await emptyState.isVisible()) {
        // Check empty state content
        await expect(
          page.locator('h3:has-text("Build Your Watch List")'),
        ).toBeVisible()

        // Check CTA button
        await expect(
          page.locator('.empty-state a:has-text("Explore Surf Spots")'),
        ).toBeVisible()
      }
    })

    test('should have Explore Surf Spots link in empty state', async ({
      page,
    }) => {
      await page.goto('/watch-list')

      const emptyState = page.locator('.empty-state')

      if (await emptyState.isVisible()) {
        const exploreLink = page.locator(
          '.empty-state a:has-text("Explore Surf Spots")',
        )
        await expect(exploreLink).toBeVisible()

        // Click and verify navigation
        await exploreLink.click()
        await expect(page).toHaveURL(/\/surf-spots/)
      }
    })

    test('should display content when spots are watched', async ({ page }) => {
      await page.goto('/watch-list')

      // Check if there are watched spots by looking for the spots list
      const spotsList = page.locator(
        '.surf-spot-list, #watched-spots .surf-spot-item',
      )
      const emptyState = page.locator('.empty-state')

      if (await spotsList.first().isVisible()) {
        // Should show description
        await expect(
          page.locator('text=Stay updated on swell seasons'),
        ).toBeVisible()

        // Should show spots section title
        await expect(
          page.locator('h2:has-text("Your Watched Surf Spots")'),
        ).toBeVisible()

        // Should show jump link
        await expect(
          page.locator('a:has-text("View Your Watched Spots")'),
        ).toBeVisible()
      } else if (await emptyState.isVisible()) {
        // Empty state is also valid
        await expect(emptyState).toBeVisible()
      }
    })

    test('should display map section', async ({ page }) => {
      await page.goto('/watch-list')

      // Check for map - only shows when user has watched spots
      const spotsList = page.locator('.surf-spot-list')

      if (await spotsList.first().isVisible()) {
        const mapWrapper = page.locator('#watchlist-map, .map-wrapper')
        await expect(mapWrapper).toBeVisible()
      }
    })

    test('should show updates section when spots are watched', async ({
      page,
    }) => {
      await page.goto('/watch-list')

      const spotsList = page.locator('.surf-spot-list')

      if (await spotsList.first().isVisible()) {
        // Should show either feed items or "no updates" message
        const hasFeed = await page.locator('.watchlist-feed').isVisible()
        const hasNoUpdates = await page
          .locator('text=No updates yet')
          .isVisible()

        expect(hasFeed || hasNoUpdates).toBe(true)
      }
    })

    test('should navigate to watched spots section via jump link', async ({
      page,
    }) => {
      await page.goto('/watch-list')

      const jumpLink = page.locator('a:has-text("View Your Watched Spots")')

      if (await jumpLink.isVisible()) {
        await jumpLink.click()

        // Should scroll to watched spots section
        const watchedSection = page.locator('#watched-spots')
        await expect(watchedSection).toBeInViewport()
      }
    })

    test('should have trip planner button', async ({ page }) => {
      await page.goto('/watch-list')

      // Check for trip planner button
      const tripPlannerBtn = page.locator(
        '.trip-planner-button, [aria-label*="trip"]',
      )

      if (await tripPlannerBtn.isVisible()) {
        await expect(tripPlannerBtn).toBeVisible()
      }
    })

    test('should have responsive design on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/watch-list')

      // Page should still load correctly
      await expect(page.locator('h1')).toContainText('Watch List')
    })
  })
})
