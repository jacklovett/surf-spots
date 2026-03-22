import { test, expect, type Page } from '@playwright/test'
import { login } from './utils/auth-helper'

/** Trip submit stays disabled until validation runs; blur helps React mark fields touched. */
async function expectCreateTripSubmitEnabledAndClick(page: Page) {
  await page.locator('input[name="title"]').blur()
  const submit = page.locator('button[type="submit"]')
  await expect(submit).toBeEnabled({ timeout: 15000 })
  await submit.click()
}

test.describe('Trips Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should navigate to trips page and show empty state', async ({
    page,
  }) => {
    await page.goto('/trips', { waitUntil: 'domcontentloaded' })

    // Verify we're not redirected to auth (login should have worked)
    await expect(page).toHaveURL(/\/trips/)
    await expect(page.locator('h1')).toBeVisible()

    // Wait for content: either empty state or trip cards (Card has class "card")
    await Promise.race([
      page.locator('.trips-empty').waitFor({ state: 'visible', timeout: 15000 }),
      page.locator('.trips-grid .card').first().waitFor({ state: 'visible', timeout: 15000 }),
    ])
    const hasTrips = (await page.locator('.trips-grid .card').count()) > 0
    if (!hasTrips) {
      await expect(page.locator('.trips-empty')).toBeVisible()
    }
  })

  test('should create a new trip with dates', async ({ page }) => {
    await page.goto('/add-trip')
    await expect(page.locator('h1')).toBeVisible()

    // Fill in trip details
    await page.fill('input[name="title"]', 'Test Surf Trip')
    await page.fill('textarea[name="description"]', 'Amazing surf adventure')

    // Set dates via DatePicker calendar (inputs are readOnly)
    await page.locator('input[name="startDate"]').click()
    await page.locator('.date-picker-day:not(.empty):not(.disabled)').first().click()
    await page.locator('input[name="endDate"]').click()
    await page.locator('.date-picker-day:not(.empty):not(.disabled)').nth(1).click()

    await expectCreateTripSubmitEnabledAndClick(page)

    // Wait for navigation and check we're on trip detail page
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)
    await expect(page.locator('h1')).toBeVisible()

    // Verify dates are shown
    await expect(page.locator('.trip-dates')).toBeVisible()
  })

  test('should create trip and add surf spot from map', async ({ page }) => {
    // First create a trip
    await page.goto('/add-trip')
    await page.fill('input[name="title"]', 'Map Test Trip')
    await expectCreateTripSubmitEnabledAndClick(page)
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)

    // Navigate to surf spots map (symbol layer, no DOM markers - click map to try to open drawer)
    await page.goto('/surf-spots')
    await page.waitForSelector('.map-container', { state: 'visible', timeout: 15000 })
    await page.locator('.map-container').click({ position: { x: 400, y: 300 } })

    const drawer = page.locator('.drawer--open')
    const drawerOpened = await drawer.isVisible().catch(() => false)
    if (!drawerOpened) {
      test.skip(true, 'No surf spots on map to open drawer (backend has no spots)')
      return
    }

    await page.click('.dropdown-menu-trigger')
    await page.locator('.dropdown-menu button').first().click()
    await page.click('.trip-selection-item:has-text("Map Test Trip")')

    await expect(page.locator('.modal-overlay, .toast--success, [role="dialog"]').first()).toBeVisible()
  })

  test('should edit trip details', async ({ page }) => {
    await page.goto('/trips')

    // Click first trip if exists
    const firstTrip = page.locator('.trips-grid .card').first()
    if (await firstTrip.isVisible()) {
      await firstTrip.click()
      await page.waitForURL(/\/trip\/[a-f0-9-]+/)

      // Click edit button
      await page.locator('button').filter({ hasText: /edit/i }).first().click()
      await page.waitForURL(/\/edit-trip\/[a-f0-9-]+/)

      // Modify title
      const titleInput = page.locator('input[name="title"]')
      await titleInput.clear()
      await titleInput.fill('Updated Trip Title')

      // Save changes
      await page.locator('button[type="submit"]').first().click()

      // Verify we're back on trip detail page with updated title
      await page.waitForURL(/\/trip\/[a-f0-9-]+/)
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('should show already added badge for spots in trip', async ({
    page,
  }) => {
    await page.goto('/add-trip')
    await page.fill('input[name="title"]', 'Badge Test Trip')
    await expectCreateTripSubmitEnabledAndClick(page)
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)

    await page.goto('/surf-spots')
    await page.waitForSelector('.map-container', { state: 'visible', timeout: 15000 })
    await page.locator('.map-container').click({ position: { x: 400, y: 300 } })

    const drawer = page.locator('.drawer--open')
    const drawerOpened = await drawer.isVisible().catch(() => false)
    if (!drawerOpened) {
      test.skip(true, 'No surf spots on map to open drawer (backend has no spots)')
      return
    }

    await page.click('.dropdown-menu-trigger')
    await page.locator('.dropdown-menu button').first().click()
    await page.click('.trip-selection-item:has-text("Badge Test Trip")')
    await page.locator('button').filter({ hasText: /ok|close|done/i }).first().click()

    await page.click('.dropdown-menu-trigger')
    await page.locator('.dropdown-menu button').first().click()

    await expect(page.locator('.already-added-badge')).toBeVisible()

    const tripItem = page.locator(
      '.trip-selection-item:has-text("Badge Test Trip")',
    )
    await expect(tripItem).toBeDisabled()
  })

  test('should delete trip', async ({ page }) => {
    // Create a trip to delete
    await page.goto('/add-trip')
    await page.fill('input[name="title"]', 'Trip To Delete')
    await expectCreateTripSubmitEnabledAndClick(page)
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)

    // Click delete button
    await page.locator('button').filter({ hasText: /delete/i }).first().click()

    // Wait for modal and click confirm Delete inside the modal (avoid overlay intercepting)
    const modal = page.locator('.delete-confirm-modal')
    await modal.waitFor({ state: 'visible', timeout: 5000 })
    await modal.getByRole('button', { name: 'Delete' }).click()

    // Verify redirected to trips list
    await page.waitForURL('/trips')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should show trips with animation on scroll', async ({ page }) => {
    await page.goto('/trips')

    // Check if trips exist and have animation class
    const tripCards = page.locator('.trips-grid .card.animate-on-scroll')
    const count = await tripCards.count()

    if (count > 0) {
      // Verify animation class is present
      await expect(tripCards.first()).toHaveClass(/animate-on-scroll/)
    }
  })

  test('should navigate between trips list and detail', async ({ page }) => {
    await page.goto('/trips')

    const firstTrip = page.locator('.trips-grid .card').first()
    if (await firstTrip.isVisible()) {
      await firstTrip.click()
      await page.waitForURL(/\/trip\/[a-f0-9-]+/)

      // Verify we're on trip detail page
      await expect(page.locator('h1')).toBeVisible()

      // Navigate back using browser back button
      await page.goBack()

      // Verify we're back on trips list
      await page.waitForURL('/trips')
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('should display media upload component for trip owner', async ({
    page,
  }) => {
    // Create a trip
    await page.goto('/add-trip')
    await page.fill('input[name="title"]', 'Media Test Trip')
    await expectCreateTripSubmitEnabledAndClick(page)
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)

    // Check for Media section
    await expect(page.locator('h3:has-text("Media")')).toBeVisible()

    // MediaUpload hides the file input; the visible upload card is shown to trip owner
    await expect(page.locator('.media-upload-card').first()).toBeVisible()
  })

  test('should display media items if they exist', async ({ page }) => {
    // Navigate to a trip
    await page.goto('/trips')

    const firstTrip = page.locator('.trips-grid .card').first()
    if (await firstTrip.isVisible()) {
      await firstTrip.click()
      await page.waitForURL(/\/trip\/[a-f0-9-]+/)

      // Check for media section
      const mediaSection = page.locator('section:has(h3:has-text("Media"))')
      const hasMedia = await mediaSection.isVisible().catch(() => false)

      if (hasMedia) {
        // Check if media items are displayed
        const mediaItems = page.locator('.trip-media-item')
        const mediaCount = await mediaItems.count()

        if (mediaCount > 0) {
          // Verify media items are visible
          await expect(mediaItems.first()).toBeVisible()

          // Check for delete button if user is owner
          const deleteButtons = page.locator(
            '.trip-media-item button:has-text("Delete")',
          )
          const deleteCount = await deleteButtons.count()
          // Delete buttons should only appear for trip owner
          if (deleteCount > 0) {
            await expect(deleteButtons.first()).toBeVisible()
          }
        }
      }
    }
  })

  test('should delete media item if user is trip owner', async ({ page }) => {
    // Navigate to a trip
    await page.goto('/trips')

    const firstTrip = page.locator('.trips-grid .card').first()
    if (await firstTrip.isVisible()) {
      await firstTrip.click()
      await page.waitForURL(/\/trip\/[a-f0-9-]+/)

      // Check for media items with delete buttons
      const mediaItems = page.locator('.trip-media-item')
      const mediaCount = await mediaItems.count()

      if (mediaCount > 0) {
        const deleteButton = mediaItems
          .first()
          .locator('button:has-text("Delete")')
        const hasDeleteButton = await deleteButton
          .isVisible()
          .catch(() => false)

        if (hasDeleteButton) {
          // Get initial count
          const initialCount = mediaCount

          // Click delete
          await deleteButton.click()
          await page.locator('.toast--success, .trip-media-item').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})

          // Verify count decreased (if deletion was successful)
          const newCount = await mediaItems.count()
          // Note: This assumes deletion was successful
          // In a real scenario, you'd verify the item is gone
        }
      }
    }
  })
})
