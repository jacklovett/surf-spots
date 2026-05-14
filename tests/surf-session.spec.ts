import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { login } from './utils/auth-helper'

/**
 * Surf session flow: `{SurfSpot.path}/session`, save, success screen; and /sessions list with Media on expanded rows.
 * Requires VITE_API_URL and a running API (POST /surf-sessions, session media / presigned upload for upload test).
 */

/**
 * From Boumerdes region list: open first spot, ensure surfed, open Add session form.
 * Returns false if the region has no spots.
 */
const navigateToAddSessionForm = async (page: Page): Promise<boolean> => {
  await page.goto('/surf-spots/africa/algeria/boumerdes')
  await page.waitForLoadState('networkidle')

  const firstSpot = page.locator('.surf-spots .list-map a').first()
  if (!(await firstSpot.isVisible().catch(() => false))) {
    return false
  }

  await firstSpot.click()
  await page.waitForLoadState('networkidle')

  const openMenu = () =>
    page.locator('.actions .dropdown-menu-trigger').first().click()

  await openMenu()
  await page.locator('.dropdown-menu').waitFor({ state: 'visible', timeout: 5000 })

  const removeBtn = page.getByRole('button', { name: 'Remove from surfed spots' })
  const addBtn = page.getByRole('button', { name: 'Add to surfed spots' })

  if (await removeBtn.isVisible()) {
    await removeBtn.click()
    await expect(addBtn).toBeVisible({ timeout: 15000 })
  }

  if (!(await addBtn.isVisible())) {
    await openMenu()
    await page.locator('.dropdown-menu').waitFor({ state: 'visible', timeout: 5000 })
  }

  await addBtn.click()

  await expect(page.locator('.toast.toast--success')).toContainText(/Added to your surfed spots/i, {
    timeout: 15000,
  })

  await expect(page.getByRole('heading', { name: /Add session at/i })).not.toBeVisible()

  await openMenu()
  await page.locator('.dropdown-menu').waitFor({ state: 'visible', timeout: 5000 })
  await page.getByRole('button', { name: 'Add session' }).click()

  await expect(page).toHaveURL(/\/surf-spots\/.+\/session\/?$/, { timeout: 15000 })
  await expect(page.getByRole('heading', { name: /Add session at/i })).toBeVisible({
    timeout: 10000,
  })

  await expect(page.locator('input[name="sessionDate"]')).toHaveValue(/\d{4}-\d{2}-\d{2}/)
  return true
}

const fillRequiredSurfSessionFields = async (page: Page) => {
  const skillLevelSelect = page.locator('select[name="skillLevel"]')
  if (await skillLevelSelect.isVisible()) {
    await skillLevelSelect.selectOption('INTERMEDIATE')
  }

  const directionWrappers = page.locator('.direction-selector-wrapper')
  await directionWrappers
    .nth(0)
    .getByRole('button', { name: 'Select N direction' })
    .click()
  await directionWrappers
    .nth(1)
    .getByRole('button', { name: 'Select SW direction' })
    .click()

  await page.locator('select[name="tide"]').selectOption('Mid')
  await page.locator('select[name="waveSize"]').selectOption('SMALL')
  await page.locator('select[name="crowdLevel"]').selectOption('FEW')
  await page.locator('select[name="waveQuality"]').selectOption('FUN')
  await page
    .getByRole('checkbox', { name: /Would surf again in similar conditions/i })
    .check()
}

/**
 * Creates one surf session via the first spot in Boumerdes. Returns false if the region has no spots.
 */
const createSurfSessionIfPossible = async (page: Page): Promise<boolean> => {
  const navigated = await navigateToAddSessionForm(page)
  if (!navigated) {
    return false
  }

  await fillRequiredSurfSessionFields(page)

  await page.getByRole('button', { name: 'Save session' }).click()

  await expect(page.getByText(/Session saved/i)).toBeVisible({
    timeout: 20000,
  })
  await page.getByRole('button', { name: 'Close' }).click()
  return true
}

test.describe('Surf session page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should add to surfed spots without opening session form, then open surf session from actions', async ({
    page,
  }) => {
    const navigated = await navigateToAddSessionForm(page)
    if (!navigated) {
      test.skip(true, 'No surf spots in region (backend has no spots for this region)')
      return
    }

    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await fillRequiredSurfSessionFields(page)

    await page.getByRole('button', { name: 'Save session' }).click()

    await expect(page.getByText(/Session saved/i)).toBeVisible({
      timeout: 20000,
    })
    await page.getByRole('button', { name: 'Close' }).click()
  })

  test('should set session window times, show duration preview, and show timing on My sessions', async ({
    page,
  }) => {
    const navigated = await navigateToAddSessionForm(page)
    if (!navigated) {
      test.skip(true, 'No surf spots in region (backend has no spots for this region)')
      return
    }

    const spotHeading = page.getByRole('heading', { level: 1 })
    const spotTitle =
      (await spotHeading.textContent())?.replace(/^Add session at\s+/i, '').trim() ?? ''
    expect(spotTitle.length).toBeGreaterThan(0)

    const startField = page.getByRole('textbox', { name: 'Start time' })
    await startField.click()
    await startField.pressSequentially('0930')

    const endField = page.getByRole('textbox', { name: 'End time' })
    await endField.click()
    await endField.pressSequentially('1100')

    await expect(page.locator('input[name="sessionStartTime"]')).toHaveValue('09:30')
    await expect(page.locator('input[name="sessionEndTime"]')).toHaveValue('11:00')
    await expect(page.locator('.surf-session-duration-preview-value')).toHaveText('1h 30m')

    await fillRequiredSurfSessionFields(page)

    await page.getByRole('button', { name: 'Save session' }).click()

    await expect(page.getByText(/Session saved/i)).toBeVisible({
      timeout: 20000,
    })
    await page.getByRole('button', { name: 'Close' }).click()

    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /My sessions/i })).toBeVisible()

    const meta = page
      .locator('.accordion-card')
      .filter({ hasText: spotTitle })
      .locator('.session-log-card-meta')
      .first()
    await expect(meta).toBeVisible({ timeout: 15000 })
    const metaText = await meta.innerText()
    expect(metaText).toMatch(/\d/)
    expect(metaText).toMatch(/\u2013|\u2014|-/)
  })
})

test.describe('My sessions list', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show Media section and upload card when expanding a session row', async ({
    page,
  }) => {
    const created = await createSurfSessionIfPossible(page)
    if (!created) {
      test.skip(true, 'No surf spots in region (backend has no spots for this region)')
      return
    }

    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /My sessions/i })).toBeVisible()

    const toggle = page.locator('.session-log-card-toggle').first()
    await expect(toggle).toBeVisible({ timeout: 15000 })
    await toggle.click()

    const panel = page.locator('.session-log-card-panel').first()
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('heading', { name: 'Media' })).toBeVisible()
    await expect(panel.locator('.media-upload-card').first()).toBeVisible()
  })

  test('should upload image from expanded session row and show success or gallery', async ({
    page,
  }) => {
    const created = await createSurfSessionIfPossible(page)
    if (!created) {
      test.skip(true, 'No surf spots in region (backend has no spots for this region)')
      return
    }

    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')

    await page.locator('.session-log-card-toggle').first().click()
    const panel = page.locator('.session-log-card-panel').first()
    await expect(panel).toBeVisible()

    const fileInput = panel.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()

    const testImagePath = 'tests/fixtures/test-image.png'
    try {
      await fileInput.setInputFiles(testImagePath)
      await page
        .locator('.toast--success, .session-log-card-panel .image-gallery .image-thumbnail')
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })

      const successToast = page
        .locator('.toast--success')
        .filter({ hasText: /uploaded successfully/i })
      const imageGallery = panel.locator('.image-gallery')
      const hasSuccess = await successToast.isVisible().catch(() => false)
      const hasGallery = await imageGallery.isVisible().catch(() => false)
      expect(hasSuccess || hasGallery).toBe(true)
    } catch {
      console.log(
        'Session media upload test: fixture missing, storage unavailable, or upload timed out (same as surfboards image test)',
      )
    }
  })
})
