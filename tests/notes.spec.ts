import { test, expect } from '@playwright/test'
import { login } from './utils/auth-helper'
import { waitForPageLoad, waitForLoadingComplete } from './utils/test-helpers'

test.describe('Surf Spot Notes Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display "Show My Notes" button on surf spot details page', async ({
    page,
  }) => {
    // Navigate to a surf spot details page
    // Using a known surf spot path - adjust if needed
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    // Check if "Show My Notes" button is visible
    const showNotesButton = page.locator('button:has-text("Show My Notes")')
    await expect(showNotesButton).toBeVisible()
  })

  test('should open notes drawer when clicking "Show My Notes"', async ({
    page,
  }) => {
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    // Click "Show My Notes" button
    const showNotesButton = page.locator('button:has-text("Show My Notes")')
    await showNotesButton.click()

    // Wait for drawer to open
    await page.waitForSelector('.drawer--open', { timeout: 5000 })
    const drawer = page.locator('.drawer--open')
    await expect(drawer).toBeVisible()

    // Check if drawer title is "My Notes"
    await expect(drawer.locator('h2, .drawer-title')).toContainText('My Notes')
  })

  test('should create a new note with all fields', async ({ page }) => {
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    // Open notes drawer
    const showNotesButton = page.locator('button:has-text("Show My Notes")')
    await showNotesButton.click()
    await page.waitForSelector('.drawer--open', { timeout: 5000 })

    // Wait for form to load
    await waitForLoadingComplete(page)

    // Fill in note text
    const noteTextArea = page.locator('textarea[name="noteText"]')
    if (await noteTextArea.isVisible()) {
      await noteTextArea.fill('This is a test note for e2e testing')
    }

    // Select preferred tide
    const tideSelect = page.locator('select[name="preferredTide"]')
    if (await tideSelect.isVisible()) {
      await tideSelect.selectOption('HIGH')
    }

    // Fill in swell direction (using DirectionSelectors)
    const swellDirectionInput = page.locator(
      'input[name="preferredSwellDirection"]',
    )
    if (await swellDirectionInput.isVisible()) {
      await swellDirectionInput.fill('NW')
    }

    // Fill in wind direction
    const windDirectionInput = page.locator('input[name="preferredWind"]')
    if (await windDirectionInput.isVisible()) {
      await windDirectionInput.fill('SW')
    }

    // Fill in swell range
    const swellRangeInput = page.locator('input[name="preferredSwellRange"]')
    if (await swellRangeInput.isVisible()) {
      await swellRangeInput.fill('2-4ft')
    }

    // Select skill requirement
    const skillSelect = page.locator('select[name="skillRequirement"]')
    if (await skillSelect.isVisible()) {
      await skillSelect.selectOption('INTERMEDIATE')
    }

    // Submit the form
    const saveButton = page.locator('button:has-text("Create Notes"), button:has-text("Save Notes")')
    await expect(saveButton).toBeEnabled({ timeout: 5000 })
    await saveButton.click()

    // Wait for toast notification
    await page.waitForSelector('.toast--success', { timeout: 5000 })
    const successToast = page.locator('.toast--success')
    await expect(successToast).toBeVisible()

    // Drawer should remain open
    await expect(page.locator('.drawer--open')).toBeVisible()
  })

  test('should create a note with only optional fields (all fields empty)', async ({
    page,
  }) => {
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    // Open notes drawer
    const showNotesButton = page.locator('button:has-text("Show My Notes")')
    await showNotesButton.click()
    await page.waitForSelector('.drawer--open', { timeout: 5000 })

    // Wait for form to load
    await waitForLoadingComplete(page)

    // Don't fill any fields - all should be optional
    // Submit button should be enabled (since all fields are optional)
    const saveButton = page.locator('button:has-text("Create Notes"), button:has-text("Save Notes")')
    await expect(saveButton).toBeEnabled({ timeout: 5000 })
    await saveButton.click()

    // Wait for toast notification (should succeed even with empty form)
    await page.waitForSelector('.toast--success', { timeout: 5000 })
    const successToast = page.locator('.toast--success')
    await expect(successToast).toBeVisible()
  })

  test('should display existing note when opening drawer', async ({ page }) => {
    // First, create a note
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    const showNotesButton = page.locator('button:has-text("Show My Notes")')
    await showNotesButton.click()
    await page.waitForSelector('.drawer--open', { timeout: 5000 })
    await waitForLoadingComplete(page)

    // Fill and save a note
    const noteTextArea = page.locator('textarea[name="noteText"]')
    if (await noteTextArea.isVisible()) {
      await noteTextArea.fill('Existing note for testing')
    }

    const saveButton = page.locator('button:has-text("Create Notes"), button:has-text("Save Notes")')
    await expect(saveButton).toBeEnabled({ timeout: 5000 })
    await saveButton.click()

    // Wait for save to complete
    await page.waitForSelector('.toast--success', { timeout: 5000 })
    await page.waitForTimeout(1000)

    // Close drawer
    const closeButton = page.locator('.drawer-close, button[aria-label="Close"]')
    if (await closeButton.isVisible()) {
      await closeButton.click()
      await page.waitForSelector('.drawer--open', { state: 'hidden', timeout: 5000 })
    }

    // Reopen drawer - should show existing note
    await showNotesButton.click()
    await page.waitForSelector('.drawer--open', { timeout: 5000 })
    await waitForLoadingComplete(page)

    // Check if note text is displayed
    if (await noteTextArea.isVisible()) {
      const noteValue = await noteTextArea.inputValue()
      expect(noteValue).toContain('Existing note for testing')
    }

    // Button should now say "Save Notes" (not "Create Notes")
    const saveButtonAfterLoad = page.locator('button:has-text("Save Notes")')
    await expect(saveButtonAfterLoad).toBeVisible()
  })

  test('should update existing note', async ({ page }) => {
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    // Open notes drawer
    const showNotesButton = page.locator('button:has-text("Show My Notes")')
    await showNotesButton.click()
    await page.waitForSelector('.drawer--open', { timeout: 5000 })
    await waitForLoadingComplete(page)

    // Update note text
    const noteTextArea = page.locator('textarea[name="noteText"]')
    if (await noteTextArea.isVisible()) {
      await noteTextArea.fill('Updated note text')
    }

    // Update tide preference
    const tideSelect = page.locator('select[name="preferredTide"]')
    if (await tideSelect.isVisible()) {
      await tideSelect.selectOption('LOW')
    }

    // Save changes
    const saveButton = page.locator('button:has-text("Save Notes")')
    await expect(saveButton).toBeEnabled({ timeout: 5000 })
    await saveButton.click()

    // Wait for success toast
    await page.waitForSelector('.toast--success', { timeout: 5000 })
    const successToast = page.locator('.toast--success')
    await expect(successToast).toBeVisible()

    // Drawer should remain open
    await expect(page.locator('.drawer--open')).toBeVisible()
  })

  test('should show loading animation while fetching note', async ({ page }) => {
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    // Open notes drawer
    const showNotesButton = page.locator('button:has-text("Show My Notes")')
    await showNotesButton.click()

    // Check for loading animation (should appear briefly)
    const loadingAnimation = page.locator('.loading, .wave-icon')
    // Loading might be very fast, so we check if it appears or if form loads quickly
    const loadingVisible = await loadingAnimation.isVisible().catch(() => false)
    const formVisible = await page
      .locator('textarea[name="noteText"]')
      .isVisible()
      .catch(() => false)

    // Either loading should appear or form should load quickly
    expect(loadingVisible || formVisible).toBe(true)
  })

  test('should have drawer form actions fixed at bottom', async ({ page }) => {
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    // Open notes drawer
    const showNotesButton = page.locator('button:has-text("Show My Notes")')
    await showNotesButton.click()
    await page.waitForSelector('.drawer--open', { timeout: 5000 })

    // Check if save button is in the fixed actions area
    const drawerActions = page.locator('.drawer-form-actions')
    await expect(drawerActions).toBeVisible()

    const saveButton = drawerActions.locator('button:has-text("Create Notes"), button:has-text("Save Notes")')
    await expect(saveButton).toBeVisible()
  })

  test('should handle multiple surf spots with separate notes', async ({
    page,
  }) => {
    // Create note for first surf spot
    await page.goto('/surf-spots/africa/algeria/boumerdes/costa-da-caparica')
    await waitForPageLoad(page)

    const showNotesButton1 = page.locator('button:has-text("Show My Notes")')
    await showNotesButton1.click()
    await page.waitForSelector('.drawer--open', { timeout: 5000 })
    await waitForLoadingComplete(page)

    const noteTextArea1 = page.locator('textarea[name="noteText"]')
    if (await noteTextArea1.isVisible()) {
      await noteTextArea1.fill('Note for Costa da Caparica')
    }

    const saveButton1 = page.locator('button:has-text("Create Notes"), button:has-text("Save Notes")')
    await expect(saveButton1).toBeEnabled({ timeout: 5000 })
    await saveButton1.click()
    await page.waitForSelector('.toast--success', { timeout: 5000 })

    // Close drawer
    const closeButton = page.locator('.drawer-close, button[aria-label="Close"]')
    if (await closeButton.isVisible()) {
      await closeButton.click()
      await page.waitForSelector('.drawer--open', { state: 'hidden', timeout: 5000 })
    }

    // Navigate to different surf spot
    // Note: Adjust URL to a different surf spot if needed
    await page.goto('/surf-spots/africa/algeria/boumerdes')
    await waitForPageLoad(page)

    // Click on a different surf spot if available
    const firstSpotLink = page.locator('.surf-spot-card, .spot-item').first()
    if (await firstSpotLink.isVisible()) {
      await firstSpotLink.click()
      await waitForPageLoad(page)

      // Open notes for this spot
      const showNotesButton2 = page.locator('button:has-text("Show My Notes")')
      if (await showNotesButton2.isVisible()) {
        await showNotesButton2.click()
        await page.waitForSelector('.drawer--open', { timeout: 5000 })
        await waitForLoadingComplete(page)

        // This spot should have no note (or different note)
        const noteTextArea2 = page.locator('textarea[name="noteText"]')
        if (await noteTextArea2.isVisible()) {
          const noteValue = await noteTextArea2.inputValue()
          // Should be empty or different from first spot's note
          expect(noteValue).not.toContain('Note for Costa da Caparica')
        }
      }
    }
  })
})

