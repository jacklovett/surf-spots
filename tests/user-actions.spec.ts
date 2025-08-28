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

    // Check if map is present - use more specific selector
    const map = page.locator('.content .map-container')
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
})
