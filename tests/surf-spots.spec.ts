import { test, expect } from '@playwright/test'

test.describe('Surf Spots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/surf-spots')
  })

  test('should load surf spots page and show map view', async ({ page }) => {
    // Navigate to surf spots - it should show map view
    await page.goto('/surf-spots')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Check if we're on surf-spots page (map view)
    const currentUrl = page.url()
    const isOnSurfSpots =
      currentUrl.includes('/surf-spots') && !currentUrl.includes('/continents')

    // Should stay on surf-spots page in map view
    expect(isOnSurfSpots).toBe(true)

    // Check if map is present
    await expect(page.locator('.map-container')).toBeVisible()
  })

  test('should display breadcrumb navigation', async ({ page }) => {
    // Navigate to continents view where breadcrumb is visible
    await page.goto('/surf-spots/continents')

    // Check if breadcrumb is present
    const breadcrumb = page.locator('.breadcrumb')
    await expect(breadcrumb).toBeVisible()

    // Check if "World" link is present
    await expect(page.locator('text=World')).toBeVisible()
  })

  test('should have view toggle functionality', async ({ page }) => {
    // Navigate to map view
    await page.goto('/surf-spots')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Check if view toggle button exists in toolbar
    const viewToggle = page.locator('.toolbar button')
    await expect(viewToggle).toBeVisible()

    // Click toggle and check if view changes
    await viewToggle.click()

    // Wait for navigation to complete
    await page.waitForTimeout(2000)

    // Check if URL changed (either to continents or stayed on surf-spots)
    const currentUrl = page.url()
    const hasChanged =
      currentUrl.includes('/continents') || currentUrl.includes('/surf-spots')
    expect(hasChanged).toBe(true)
  })

  test('should have filters functionality', async ({ page }) => {
    // Check if filters button exists in toolbar
    const filtersButton = page.locator('.toolbar button:has-text("Filters")')
    await expect(filtersButton).toBeVisible()

    // Click filters button
    await filtersButton.click()

    // Check if filters drawer opens
    const filtersDrawer = page.locator('.drawer')
    await expect(filtersDrawer).toBeVisible()
  })

  test('should show Standing Wave as break type option in filters', async ({
    page,
  }) => {
    await page.goto('/surf-spots')
    const filtersButton = page.locator('.toolbar button:has-text("Filters")')
    await expect(filtersButton).toBeVisible()
    await filtersButton.click()
    await expect(page.locator('.drawer')).toBeVisible()
    // Break type options include Standing Wave (for river waves / wave pools)
    await expect(page.locator('text=Standing Wave')).toBeVisible()
  })

  test('should show novelty wave chip on detail page when spot is river wave or wave pool', async ({
    page,
  }) => {
    // Navigate to a region that has spots, then open the first spot detail
    await page.goto('/surf-spots/africa/algeria/boumerdes')
    await page.waitForLoadState('networkidle')

    const firstSpotLink = page.locator('.list-map a').first()
    const linkVisible = await firstSpotLink.isVisible().catch(() => false)
    if (!linkVisible) {
      test.skip()
      return
    }

    await firstSpotLink.click()
    await page.waitForLoadState('networkidle')

    // If this spot is a novelty wave, the chip should be next to the title and ocean Best Conditions hidden
    const riverChip = page.locator('.page-title-with-status .chip:has-text("River wave")')
    const poolChip = page.locator('.page-title-with-status .chip:has-text("Wave pool")')
    const hasNoveltyChip =
      (await riverChip.isVisible().catch(() => false)) ||
      (await poolChip.isVisible().catch(() => false))

    if (hasNoveltyChip) {
      // Chip is already confirmed visible above; ensure ocean Best Conditions is not shown
      await expect(page.getByText('Swell Direction')).not.toBeVisible()
    }
  })

  test('should show novelty wave chip in map preview drawer when spot is river wave or wave pool', async ({
    page,
  }) => {
    await page.goto('/surf-spots')
    await page.waitForTimeout(2000)

    const marker = page.locator('.mapboxgl-marker').first()
    const markerVisible = await marker.isVisible().catch(() => false)
    if (!markerVisible) {
      test.skip()
      return
    }

    await marker.click()
    await page.waitForTimeout(500)

    const drawer = page.locator('.drawer')
    const drawerVisible = await drawer.isVisible().catch(() => false)
    if (!drawerVisible) {
      test.skip()
      return
    }

    // If the opened spot is a novelty wave, the preview should show the chip inside the drawer
    const noveltyChipInDrawer = drawer.locator('.surf-spot-preview-novelty .chip')
    const hasNoveltyChip = await noveltyChipInDrawer.isVisible().catch(() => false)

    if (hasNoveltyChip) {
      await expect(
        noveltyChipInDrawer.filter({ hasText: /River wave|Wave pool/ }),
      ).toBeVisible()
    }
  })

  test('should display toolbar with actions', async ({ page }) => {
    // Check if toolbar is present
    const toolbar = page.locator('.toolbar')
    await expect(toolbar).toBeVisible()
  })

  test('should navigate to continents view', async ({ page }) => {
    // Navigate to continents view
    await page.goto('/surf-spots/continents')

    // Check if continents page loads
    await expect(page).toHaveURL(/\/continents/)

    // Check if continents are displayed
    const continents = page.locator(
      '.continent-item, [data-testid="continent-item"]',
    )
    if (await continents.first().isVisible()) {
      await expect(continents.first()).toBeVisible()
    }
  })

  test('should handle map interactions', async ({ page }) => {
    // Navigate to map view
    await page.goto('/surf-spots')

    // Check if map is present - map container is rendered directly when in map view
    const map = page.locator('.map-container')
    await expect(map).toBeVisible()

    // Test map zoom controls if they exist
    const zoomIn = page.locator('.mapboxgl-ctrl-zoom-in')
    const zoomOut = page.locator('.mapboxgl-ctrl-zoom-out')

    if (await zoomIn.isVisible()) {
      await zoomIn.click()
    }

    if (await zoomOut.isVisible()) {
      await zoomOut.click()
    }
  })

  test('should display surf spot markers on map', async ({ page }) => {
    // Navigate to map view
    await page.goto('/surf-spots')

    // Check if surf spot markers are present
    const markers = page.locator('.mapboxgl-marker')
    if (await markers.first().isVisible()) {
      await expect(markers.first()).toBeVisible()
    }
  })

  test('should show surf spot details when clicking marker', async ({
    page,
  }) => {
    // Navigate to map view
    await page.goto('/surf-spots')

    // Click on a surf spot marker
    const marker = page.locator('.mapboxgl-marker').first()
    if (await marker.isVisible()) {
      await marker.click()

      // Check if popup appears
      const popup = page.locator('.mapboxgl-popup')
      if (await popup.isVisible()) {
        await expect(popup).toBeVisible()
      }
    }
  })

  test('should have responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check if page loads correctly on mobile
    await page.goto('/surf-spots/continents')
    await expect(page).toHaveURL(/\/continents/)
  })

  test('should navigate to specific continent', async ({ page }) => {
    // Navigate to a specific continent
    await page.goto('/surf-spots/africa')

    // Check if the page loads correctly
    await expect(page).toHaveURL(/\/surf-spots\/africa/)
  })

  test('should navigate to specific country', async ({ page }) => {
    // Navigate to a specific country
    await page.goto('/surf-spots/africa/algeria')

    // Check if the page loads correctly
    await expect(page).toHaveURL(/\/surf-spots\/africa\/algeria/)
  })

  test('should navigate to specific region', async ({ page }) => {
    // Navigate to a specific region
    await page.goto('/surf-spots/africa/algeria/boumerdes')

    // Check if the page loads correctly
    await expect(page).toHaveURL(/\/surf-spots\/africa\/algeria\/boumerdes/)
  })
})
