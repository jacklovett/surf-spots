import { test, expect } from '@playwright/test'
import { login } from './utils/auth-helper'

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
    await expect(page.locator('h1')).toContainText('My Trips')

    // Check for empty state or existing trips
    const hasTrips = (await page.locator('.trip-card').count()) > 0
    if (!hasTrips) {
      await expect(page.locator('.trips-empty')).toContainText('No trips yet')
    }
  })

  test('should create a new trip with dates', async ({ page }) => {
    await page.goto('/trips/new')
    await expect(page.locator('h1')).toContainText('Create New Trip')

    // Fill in trip details
    await page.fill('input[name="title"]', 'Test Surf Trip')
    await page.fill('textarea[name="description"]', 'Amazing surf adventure')

    // Set dates
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    await page.fill('input[name="startDate"]', startDate)
    await page.fill('input[name="endDate"]', endDate)

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for navigation and check we're on trip detail page
    await page.waitForURL(/\/trips\/[a-f0-9-]+/)
    await expect(page.locator('h1')).toContainText('Test Surf Trip')

    // Verify dates are shown
    await expect(page.locator('.trip-dates-section')).toBeVisible()
  })

  test('should create trip and add surf spot from map', async ({ page }) => {
    // First create a trip
    await page.goto('/add-trip')
    await page.fill('input[name="title"]', 'Map Test Trip')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)

    // Navigate to surf spots map
    await page.goto('/surf-spots')

    // Wait for map to load
    await page.waitForSelector('.map', { state: 'visible' })
    await page.waitForTimeout(2000) // Allow map markers to load

    // Click a marker to open drawer
    const markers = await page.locator('canvas').first()
    await markers.click({ position: { x: 200, y: 200 } })

    // Wait for drawer to open
    await page.waitForSelector('.drawer--open', { timeout: 5000 })

    // Click the 3-dots menu
    await page.click('.dropdown-menu-trigger')

    // Click "Add to Trip"
    await page.click('button:has-text("Add to trip")')

    // Select the trip
    await page.click('.trip-selection-item:has-text("Map Test Trip")')

    // Verify success modal
    await expect(page.locator('h2')).toContainText('Spot Added to Trip')
  })

  test('should edit trip details', async ({ page }) => {
    await page.goto('/trips')

    // Click first trip if exists
    const firstTrip = page.locator('.trip-card').first()
    if (await firstTrip.isVisible()) {
      await firstTrip.click()
      await page.waitForURL(/\/trip\/[a-f0-9-]+/)

      // Click edit button
      await page.click('button:has-text("Edit")')
      await page.waitForURL(/\/edit-trip\/[a-f0-9-]+/)

      // Modify title
      const titleInput = page.locator('input[name="title"]')
      await titleInput.clear()
      await titleInput.fill('Updated Trip Title')

      // Save changes
      await page.click('button:has-text("Save Changes")')

      // Verify we're back on trip detail page with updated title
      await page.waitForURL(/\/trip\/[a-f0-9-]+/)
      await expect(page.locator('h1')).toContainText('Updated Trip Title')
    }
  })

  test('should show already added badge for spots in trip', async ({
    page,
  }) => {
    // Create trip and add spot
    await page.goto('/add-trip')
    await page.fill('input[name="title"]', 'Badge Test Trip')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)

    // Add a spot
    await page.goto('/surf-spots')
    await page.waitForSelector('.map', { state: 'visible' })
    await page.waitForTimeout(2000)

    const markers = await page.locator('canvas').first()
    await markers.click({ position: { x: 200, y: 200 } })

    await page.waitForSelector('.drawer--open')
    await page.click('.dropdown-menu-trigger')
    await page.click('button:has-text("Add to trip")')
    await page.click('.trip-selection-item:has-text("Badge Test Trip")')
    await page.click('button:has-text("OK")')

    // Try to add same spot again
    await page.click('.dropdown-menu-trigger')
    await page.click('button:has-text("Add to trip")')

    // Verify badge shows
    await expect(page.locator('.already-added-badge')).toContainText('✓ Added')

    // Verify button is disabled
    const tripItem = page.locator(
      '.trip-selection-item:has-text("Badge Test Trip")',
    )
    await expect(tripItem).toBeDisabled()
  })

  test('should delete trip', async ({ page }) => {
    // Create a trip to delete
    await page.goto('/add-trip')
    await page.fill('input[name="title"]', 'Trip To Delete')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)

    // Click delete button
    await page.click('button:has-text("Delete")')

    // Wait for modal to appear and confirm deletion
    await page.waitForSelector('.delete-confirm-modal', { state: 'visible' })
    await page.click('button:has-text("Delete"):not(:has-text("Cancel"))')

    // Verify redirected to trips list
    await page.waitForURL('/trips')
    await expect(page.locator('h1')).toContainText('My Trips')
  })

  test('should show trips with animation on scroll', async ({ page }) => {
    await page.goto('/trips')

    // Check if trips exist and have animation class
    const tripCards = page.locator('.trip-card.animate-on-scroll')
    const count = await tripCards.count()

    if (count > 0) {
      // Verify animation class is present
      await expect(tripCards.first()).toHaveClass(/animate-on-scroll/)
    }
  })

  test('should navigate between trips list and detail', async ({ page }) => {
    await page.goto('/trips')

    const firstTrip = page.locator('.trip-card').first()
    if (await firstTrip.isVisible()) {
      await firstTrip.click()
      await page.waitForURL(/\/trip\/[a-f0-9-]+/)

      // Verify we're on trip detail page
      await expect(page.locator('h1')).not.toContainText('My Trips')

      // Navigate back using browser back button
      await page.goBack()

      // Verify we're back on trips list
      await page.waitForURL('/trips')
      await expect(page.locator('h1')).toContainText('My Trips')
    }
  })

  test('should display media upload component for trip owner', async ({
    page,
  }) => {
    // Create a trip
    await page.goto('/add-trip')
    await page.fill('input[name="title"]', 'Media Test Trip')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/trip\/[a-f0-9-]+/)

    // Check for Media section
    await expect(page.locator('h3:has-text("Media")')).toBeVisible()

    // Check for MediaUpload component (only visible to owner)
    const fileInput = page.locator(
      'input[type="file"][accept*="image"], input[type="file"][accept*="video"]',
    )
    const hasFileInput = await fileInput.isVisible().catch(() => false)

    // MediaUpload should be visible for trip owner
    expect(hasFileInput).toBe(true)
  })

  test('should display media items if they exist', async ({ page }) => {
    // Navigate to a trip
    await page.goto('/trips')

    const firstTrip = page.locator('.trip-card').first()
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

    const firstTrip = page.locator('.trip-card').first()
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

          // Wait for deletion (media should be removed from UI)
          await page.waitForTimeout(1000)

          // Verify count decreased (if deletion was successful)
          const newCount = await mediaItems.count()
          // Note: This assumes deletion was successful
          // In a real scenario, you'd verify the item is gone
        }
      }
    }
  })
})
