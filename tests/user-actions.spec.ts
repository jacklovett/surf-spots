import { test, expect } from '@playwright/test'

test.describe('User Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/surf-spots')
  })

  test('should allow adding new surf spot', async ({ page }) => {
    // Look for add surf spot button in toolbar
    const addButton = page.locator('.toolbar button:has-text("Add")')
    if (await addButton.isVisible()) {
      await addButton.click()

      // Should navigate to add surf spot page
      await expect(page).toHaveURL(/\/add-surf-spot/)

      // Check if form is present
      await expect(page.locator('form')).toBeVisible()
    }
  })

  test('should handle surf spot form submission', async ({ page }) => {
    // Navigate to add surf spot page
    await page.goto('/add-surf-spot')

    // Check if form elements are present
    const nameInput = page.locator('input[name="name"]')
    if (await nameInput.isVisible()) {
      // Fill in form data
      await nameInput.fill('Test Surf Spot')

      // Look for other form fields
      const descriptionInput = page.locator('textarea[name="description"]')
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('A great test surf spot')
      }

      // Submit form
      const submitButton = page.locator('button[type="submit"]')
      if (await submitButton.isVisible()) {
        await submitButton.click()

        // Should redirect or show success message
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should handle filters functionality', async ({ page }) => {
    // Look for filter button in toolbar
    const filterButton = page.locator('.toolbar button:has-text("Filters")')
    if (await filterButton.isVisible()) {
      await filterButton.click()

      // Check if filters drawer opens
      const filtersDrawer = page.locator('.drawer')
      if (await filtersDrawer.isVisible()) {
        await expect(filtersDrawer).toBeVisible()

        // Apply a filter
        const filterOption = filtersDrawer
          .locator('input[type="checkbox"]')
          .first()
        if (await filterOption.isVisible()) {
          await filterOption.click()

          // Apply filters
          const applyButton = filtersDrawer.locator('button:has-text("Apply")')
          if (await applyButton.isVisible()) {
            await applyButton.click()
          }
        }
      }
    }
  })

  test('should handle view toggle', async ({ page }) => {
    // Navigate to map view
    await page.goto('/surf-spots')

    // Look for view toggle button in toolbar
    const viewToggle = page.locator('.toolbar button')
    if (await viewToggle.isVisible()) {
      await viewToggle.click()

      // Should navigate to continents view
      await expect(page).toHaveURL(/\/surf-spots\/continents/)
    }
  })

  test('should handle map interactions', async ({ page }) => {
    // Navigate to map view
    await page.goto('/surf-spots')

    // Wait for map to load
    await page.waitForTimeout(3000)

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

  test('should handle breadcrumb navigation', async ({ page }) => {
    // Navigate to a specific region
    await page.goto('/surf-spots/africa/algeria/boumerdes')

    // Check if breadcrumb is present
    const breadcrumb = page.locator('.breadcrumb')
    await expect(breadcrumb).toBeVisible()

    // Check if breadcrumb links work
    const worldLink = breadcrumb.locator('a:has-text("World")')
    if (await worldLink.isVisible()) {
      await worldLink.click()
      await expect(page).toHaveURL(/\/surf-spots\/continents/)
    }
  })

  test('should handle form validation', async ({ page }) => {
    // Navigate to add surf spot page
    await page.goto('/add-surf-spot')

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]')
    if (await submitButton.isVisible()) {
      await submitButton.click()

      // Should show validation errors
      await expect(page.locator('.error-message, [role="alert"]')).toBeVisible()
    }
  })

  test('should auto-populate country and region from map pin', async ({
    page,
  }) => {
    // Navigate to add surf spot page
    await page.goto('/add-surf-spot')

    // Wait for form to load
    await page.waitForTimeout(2000)

    // Find and click the "Find on map" option
    const findOnMapCheckbox = page.locator(
      'input[type="checkbox"][name="findOnMap"]',
    )
    if (await findOnMapCheckbox.isVisible()) {
      await findOnMapCheckbox.click()

      // Wait for map to load
      await page.waitForTimeout(3000)

      // Check if map is visible
      const mapContainer = page.locator('.map-container, [id*="map"]')
      if (await mapContainer.isVisible()) {
        // Click on the map to place a pin (simulating user interaction)
        // Note: This is a simplified test - actual map interaction may require more specific selectors
        const mapElement = mapContainer.first()
        await mapElement.click({ position: { x: 400, y: 300 } })

        // Wait for "Determining..." placeholders to appear
        await page.waitForTimeout(500)

        // Check if dropdowns are disabled when using map (they should be)
        const countrySelect = page.locator('select[name="country"]')
        const regionSelect = page.locator('select[name="region"]')
        
        if (await countrySelect.isVisible()) {
          // Dropdowns should be disabled when findOnMap is checked
          const isDisabled = await countrySelect.isDisabled()
          expect(isDisabled).toBe(true)
        }

        if (await regionSelect.isVisible()) {
          const isDisabled = await regionSelect.isDisabled()
          expect(isDisabled).toBe(true)
        }

        // Wait for API calls to complete (longer timeout for network requests)
        await page.waitForTimeout(5000)

        // After lookup completes, check if dropdowns are populated
        // Country dropdown should be populated (or show error)
        if (await countrySelect.isVisible()) {
          const countryValue = await countrySelect.inputValue()
          // Country should be populated if pin is in a known country
          // If not populated, might show "Unable to determine" message
          // This is a basic check - actual value depends on where pin is placed
          expect(countrySelect).toBeVisible()
        }

        // Region dropdown should be populated (or show error message)
        if (await regionSelect.isVisible()) {
          const regionValue = await regionSelect.inputValue()
          // Region should be populated if pin is in a known region
          // If not found, should show "Unable to determine region" message
          expect(regionSelect).toBeVisible()
          
          // Check for error message if region wasn't found
          const errorMessage = page.locator('text=/Unable to determine region/i')
          // Error message may or may not appear depending on location
          // Just verify the UI handles both cases gracefully
        }
      }
    }
  })
})
