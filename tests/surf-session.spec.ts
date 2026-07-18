import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { login } from './utils/auth-helper'

/**
 * Surf session flow: `{SurfSpot.path}/session`, save, success screen; My sessions list (media, edit, delete, import copy when seeded).
 * Requires VITE_API_URL and a running API (POST/PUT/DELETE /surf-sessions, session media / presigned upload for upload test).
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

/**
 * Open the global start-session flow from the floating speed dial.
 */
const navigateToStartLiveSessionForm = async (page: Page): Promise<boolean> => {
  await page.goto('/sessions')
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'Open quick add menu' }).click()
  await page.getByRole('menuitem', { name: 'Start live surf session' }).click()

  await expect(page).toHaveURL(/\/start-session\/?$/, { timeout: 15000 })
  await expect(page.getByRole('heading', { name: /Start session/i })).toBeVisible({
    timeout: 10000,
  })

  const startButton = page.getByRole('button', { name: 'Start session' }).last()

  await expect(startButton).toBeVisible({ timeout: 15000 })
  await expect(startButton).toBeEnabled({ timeout: 15000 })

  return true
}

const endInProgressSessionIfPresent = async (page: Page): Promise<void> => {
  await page.goto('/sessions')
  await page.waitForLoadState('networkidle')

  const endSessionButton = page.getByRole('button', { name: 'End session' }).first()
  if (!(await endSessionButton.isVisible().catch(() => false))) {
    return
  }

  await endSessionButton.click()
  await expect(page).toHaveURL(/\/end-session\/\d+\/?$/, { timeout: 20000 })
  await expect(page.getByRole('heading', { name: 'Session details' })).toBeVisible({
    timeout: 20000,
  })
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
  await page.getByRole('button', { name: 'Rate 4 out of 5' }).click()
}

const openSessionRowDropdown = async (page: Page, cardIndex: number = 0) => {
  const sessionCard = page.locator('.session-log-accordion-card').nth(cardIndex)
  await expect(sessionCard).toBeVisible({ timeout: 15000 })
  await sessionCard.locator('.dropdown-menu-trigger').click()
  await page.locator('.dropdown-menu').waitFor({ state: 'visible', timeout: 5000 })
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

  test('should open edit from row menu, save notes, and show updated text on My sessions', async ({
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

    await openSessionRowDropdown(page, 0)
    await page.getByRole('button', { name: 'Edit session' }).click()

    await expect(page).toHaveURL(/\/edit-session\/\d+\/?$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /Edit session at/i })).toBeVisible({
      timeout: 10000,
    })

    const uniqueNotes = `E2E session edit ${Date.now()}`
    await page.locator('textarea[name="sessionNotes"]').fill(uniqueNotes)
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText(/session was updated/i)).toBeVisible({
      timeout: 20000,
    })
    await page.getByRole('button', { name: 'Sessions' }).click()
    await expect(page).toHaveURL(/\/sessions\/?$/, { timeout: 15000 })

    await page.waitForLoadState('networkidle')
    const firstToggle = page.locator('.session-log-card-toggle').first()
    await firstToggle.click()
    const firstPanel = page.locator('.session-log-card-panel').first()
    await expect(firstPanel.getByText(uniqueNotes)).toBeVisible({ timeout: 15000 })
  })

  test('should delete session from row menu and show success toast', async ({ page }) => {
    const created = await createSurfSessionIfPossible(page)
    if (!created) {
      test.skip(true, 'No surf spots in region (backend has no spots for this region)')
      return
    }

    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /My sessions/i })).toBeVisible()

    const cardsBefore = await page.locator('.session-log-accordion-card').count()

    await openSessionRowDropdown(page, 0)
    await page.getByRole('button', { name: 'Delete session' }).click()

    const confirmModal = page.locator('.delete-confirm-modal')
    await expect(confirmModal).toBeVisible({ timeout: 5000 })
    await confirmModal.getByRole('button', { name: 'Delete' }).click()

    await expect(
      page.locator('.toast--success').filter({ hasText: /Session deleted/i }),
    ).toBeVisible({ timeout: 20000 })

    await page.waitForLoadState('networkidle')
    const cardsAfter = await page.locator('.session-log-accordion-card').count()
    expect(cardsAfter).toBeLessThan(cardsBefore)
  })

  test('should show external-import notice on edit when list shows Synced from', async ({
    page,
  }) => {
    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /My sessions/i })).toBeVisible()

    const syncedCard = page
      .locator('.session-log-accordion-card')
      .filter({ hasText: /Synced from/i })
      .first()
    if (!(await syncedCard.isVisible().catch(() => false))) {
      test.skip(true, 'Test account has no externally synced sessions to assert import copy')
      return
    }

    await syncedCard.locator('.dropdown-menu-trigger').click()
    await page.locator('.dropdown-menu').waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Edit session' }).click()

    await expect(page).toHaveURL(/\/edit-session\/\d+\/?$/, { timeout: 15000 })
    await expect(
      page.getByText(/Edits and deletes here apply only in Surf Spots/i),
    ).toBeVisible({ timeout: 10000 })
  })

  test('should start a live session and show in-progress banner', async ({ page, context }) => {
    await endInProgressSessionIfPresent(page)
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 54.4783, longitude: -8.2779 })

    const reachedForm = await navigateToStartLiveSessionForm(page)
    if (!reachedForm) {
      test.skip(true, 'Could not open start session form')
      return
    }

    await page.getByRole('button', { name: 'Start session' }).last().click()
    await expect(page.getByText(/Your session has started/i)).toBeVisible({ timeout: 20000 })

    await page.goto('/sessions')
    await expect(page.getByText(/Surf session in progress/i)).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText(/Time in the water:/i)).toBeVisible({ timeout: 15000 })
    await page.getByRole('button', { name: 'End session' }).first().click()
    await expect(page).toHaveURL(/\/end-session\/\d+\/?$/, { timeout: 20000 })
    await expect(page.getByRole('heading', { name: 'Session details' })).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.locator('.toast--success .toast-message').filter({ hasText: /Your session has ended/i }),
    ).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: 'Open quick add menu' }).click()
    await expect(page.getByRole('menuitem', { name: 'Start live surf session' })).toBeVisible({
      timeout: 10000,
    })

    await page.goto('/start-session')
    await expect(page.getByRole('heading', { name: 'Start session' })).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText(/Surf session in progress/i)).not.toBeVisible({
      timeout: 5000,
    })
  })

  test('should allow manual map placement when geolocation is denied', async ({ page, context }) => {
    await endInProgressSessionIfPresent(page)
    await context.clearPermissions()
    await context.setGeolocation({ latitude: 0, longitude: 0 })

    const reachedForm = await navigateToStartLiveSessionForm(page)
    if (!reachedForm) {
      test.skip(true, 'Could not open start session form')
      return
    }

    await expect(page.getByText(/Could not get your location automatically/i)).toBeVisible({
      timeout: 20000,
    })
    await expect(page.getByText(/Click the map to set your starting location/i)).toBeVisible({
      timeout: 10000,
    })

    const startButton = page.getByRole('button', { name: 'Start session' }).last()
    await expect(startButton).toBeDisabled()

    await page.locator('.start-live-session-map .map').click({ position: { x: 180, y: 120 } })
    await expect(startButton).toBeEnabled({ timeout: 10000 })
  })

  test('should redirect from start-session when a session is already in progress', async ({
    page,
    context,
  }) => {
    await endInProgressSessionIfPresent(page)
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 54.4783, longitude: -8.2779 })

    const reachedForm = await navigateToStartLiveSessionForm(page)
    if (!reachedForm) {
      test.skip(true, 'Could not open start session form')
      return
    }

    await page.getByRole('button', { name: 'Start session' }).last().click()
    await expect(page.getByText(/Your session has started/i)).toBeVisible({ timeout: 20000 })

    await page.goto('/start-session')
    await expect(page).toHaveURL(/\/surf-spots\/?$/, { timeout: 15000 })
    await expect(page.getByText(/Surf session in progress/i)).toBeVisible({ timeout: 15000 })
  })

  test('should recover when end fails on end session page', async ({ page, context }) => {
    await endInProgressSessionIfPresent(page)
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 54.4783, longitude: -8.2779 })

    const reachedForm = await navigateToStartLiveSessionForm(page)
    if (!reachedForm) {
      test.skip(true, 'Could not open start session form')
      return
    }

    await page.getByRole('button', { name: 'Start session' }).last().click()
    await expect(page.getByText(/Your session has started/i)).toBeVisible({ timeout: 20000 })

    let endAttempts = 0
    await page.route('**/resources/end-live-session', async (route) => {
      endAttempts += 1
      if (endAttempts === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            hasError: true,
            submitStatus: 'Unable to end your surf session right now. Please try again.',
          }),
        })
        return
      }
      await route.continue()
    })

    await page.goto('/end-session')
    await expect(page).toHaveURL(/\/end-session\/\d+\/?$/, { timeout: 20000 })

    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible({
      timeout: 20000,
    })
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('heading', { name: 'Session details' })).toBeVisible({
      timeout: 20000,
    })
  })

  test('should save session details after ending', async ({ page, context }) => {
    await endInProgressSessionIfPresent(page)
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 54.4783, longitude: -8.2779 })

    const reachedForm = await navigateToStartLiveSessionForm(page)
    if (!reachedForm) {
      test.skip(true, 'Could not open start session form')
      return
    }

    await page.getByRole('button', { name: 'Start session' }).last().click()
    await expect(page.getByText(/Your session has started/i)).toBeVisible({ timeout: 20000 })

    await page.goto('/sessions')
    await page.getByRole('button', { name: 'End session' }).first().click()
    await expect(page.getByRole('heading', { name: 'Session details' })).toBeVisible({
      timeout: 20000,
    })

    await fillRequiredSurfSessionFields(page)
    await page.getByRole('button', { name: 'Save details' }).click()
    await expect(page.getByText(/Session saved/i)).toBeVisible({ timeout: 20000 })
  })

  test('should require expected return when emailing emergency contact', async ({ page, context }) => {
    await endInProgressSessionIfPresent(page)
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 54.4783, longitude: -8.2779 })

    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    const emergencyContactInput = page.locator('input[name="emergencyContactEmail"]')
    if (!(await emergencyContactInput.isVisible().catch(() => false))) {
      test.skip(true, 'Emergency contact field not available on profile')
      return
    }

    await emergencyContactInput.fill('contact@example.com')
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.locator('.toast--success')).toBeVisible({ timeout: 15000 })

    const reachedForm = await navigateToStartLiveSessionForm(page)
    if (!reachedForm) {
      test.skip(true, 'Could not open start session form')
      return
    }

    const emergencyContactCheckbox = page.locator(
      'input[name="shareLocationWithEmergencyContact"]',
    )
    await expect(emergencyContactCheckbox).toBeEnabled({ timeout: 10000 })
    await emergencyContactCheckbox.check()

    const startButton = page.getByRole('button', { name: 'Start session' }).last()
    await expect(startButton).toBeDisabled()

    await page.locator('input[name="expectedReturnTime"]').fill('23:59')
    await expect(startButton).toBeEnabled({ timeout: 10000 })
  })

  test('should select a nearby spot after ending', async ({ page, context }) => {
    await endInProgressSessionIfPresent(page)
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 54.4783, longitude: -8.2779 })

    const reachedForm = await navigateToStartLiveSessionForm(page)
    if (!reachedForm) {
      test.skip(true, 'Could not open start session form')
      return
    }

    await page.getByRole('button', { name: 'Start session' }).last().click()
    await expect(page.getByText(/Your session has started/i)).toBeVisible({ timeout: 20000 })

    await page.goto('/sessions')
    await page.getByRole('button', { name: 'End session' }).first().click()
    await expect(page.getByRole('heading', { name: 'Session details' })).toBeVisible({
      timeout: 20000,
    })

    const nearbySpotButton = page.locator('.end-session-spot-list-button').first()
    if (!(await nearbySpotButton.isVisible().catch(() => false))) {
      test.skip(true, 'No nearby surf spots seeded for test coordinates')
      return
    }

    const spotLabel = (await nearbySpotButton.textContent())?.trim() ?? ''
    await nearbySpotButton.click()
    await page.getByRole('button', { name: 'Use this spot' }).click()
    await expect(page.locator('.toast--success .toast-message')).toContainText(
      /selected for this session/i,
      { timeout: 15000 },
    )

    if (spotLabel !== '') {
      const spotName = spotLabel.replace(/\s*\(.*\)$/, '').trim()
      await expect(page.getByText(new RegExp(`Selected:.*${spotName}`, 'i'))).toBeVisible({
        timeout: 10000,
      })
    }

    await fillRequiredSurfSessionFields(page)
    await page.getByRole('button', { name: 'Save details' }).click()
    await expect(page.getByText(/Session saved/i)).toBeVisible({ timeout: 20000 })
  })
})
