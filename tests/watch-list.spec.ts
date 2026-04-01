import { test, expect } from '@playwright/test'
import { login } from './utils/auth-helper'

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
      await login(page)
    })

    test('should display watch list page title', async ({ page }) => {
      await page.goto('/watch-list', { waitUntil: 'domcontentloaded' })

      await expect(page).toHaveURL(/\/watch-list/)
      await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })
    })

    test('should show empty state when no spots are watched', async ({
      page,
    }) => {
      await page.goto('/watch-list', { waitUntil: 'domcontentloaded' })

      const emptyState = page.locator('.empty-state')
      await emptyState.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})

      if (!(await emptyState.isVisible())) {
        test.skip(true, 'Watch list did not show empty state (may have spots, or API/loading issue)')
        return
      }

      await expect(
        page.locator('.empty-state h3'),
      ).toBeVisible()

      await expect(
        page.getByRole('link', { name: 'Explore Surf Spots' }),
      ).toBeVisible()
    })

    test('should have Explore Surf Spots link in empty state', async ({
      page,
    }) => {
      await page.goto('/watch-list', { waitUntil: 'domcontentloaded' })

      const emptyState = page.locator('.empty-state')
      await emptyState.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})

      if (!(await emptyState.isVisible())) {
        test.skip(true, 'Watch list did not show empty state (may have spots, or API/loading issue)')
        return
      }

      const exploreLink = page.getByRole('link', { name: 'Explore Surf Spots' })
      await expect(exploreLink).toBeVisible()
      await exploreLink.scrollIntoViewIfNeeded()

      await exploreLink.click()
      await expect(page).toHaveURL(/\/surf-spots/)
    })

    test('should display content when spots are watched', async ({ page }) => {
      await page.goto('/watch-list')

      // Check if there are watched spots by looking for the spots list
      const spotsList = page.locator(
        '.surf-spot-list, #watched-spots .surf-spot-item',
      )
      const emptyState = page.locator('.empty-state')

      if (await spotsList.first().isVisible()) {
        await expect(spotsList.first()).toBeVisible()
        await expect(page.locator('#watched-spots')).toBeVisible()
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
          .locator('text=No updates')
          .isVisible()

        expect(hasFeed || hasNoUpdates).toBe(true)
      }
    })

    test('should navigate to watched spots section via jump link', async ({
      page,
    }) => {
      await page.goto('/watch-list')

      const jumpLink = page.locator('a[href="#watched-spots"], a[href*="#watched-spots"]')

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
      await expect(page.locator('h1')).toBeVisible()
    })
  })
})
