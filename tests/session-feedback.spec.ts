import { test, expect } from '@playwright/test'
import { login } from './utils/auth-helper'

/**
 * Session log at `{SurfSpot.path}/session` (e.g. `/surf-spots/.../slug/session`, or with
 * `.../sub-regions/.../slug/session`). Open from spot actions, fill fields, thank-you state.
 * Requires VITE_API_URL and a running API that accepts POST /surf-sessions with structured fields.
 */
test.describe('Session log page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should add to surfed spots without opening session form, then open session log from actions', async ({
    page,
  }) => {
    await page.goto('/surf-spots/africa/algeria/boumerdes')
    await page.waitForLoadState('networkidle')

    const firstSpot = page.locator('.surf-spots .list-map a').first()
    if (!(await firstSpot.isVisible().catch(() => false))) {
      test.skip(true, 'No surf spots in region (backend has no spots for this region)')
      return
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

    await expect(page.getByRole('heading', { name: /Log Session at/i })).not.toBeVisible()

    await openMenu()
    await page.locator('.dropdown-menu').waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Log your surf' }).click()

    await expect(page).toHaveURL(/\/surf-spots\/.+\/session\/?$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /Log Session at/i })).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await expect(page.locator('input[name="sessionDate"]')).toHaveValue(/\d{4}-\d{2}-\d{2}/)

    const skillLevelSelect = page.locator('select[name="skillLevel"]')
    if (await skillLevelSelect.isVisible()) {
      await skillLevelSelect.selectOption('INTERMEDIATE')
    }

    await page.locator('select[name="waveSize"]').selectOption('SMALL')
    await page.locator('select[name="crowdLevel"]').selectOption('FEW')
    await page.locator('select[name="waveQuality"]').selectOption('FUN')
    await page
      .getByRole('checkbox', { name: /Would you surf here again/i })
      .check()

    await page.getByRole('button', { name: 'Save session' }).click()

    await expect(page.getByText(/Session saved/i)).toBeVisible({
      timeout: 20000,
    })
    await page.getByRole('button', { name: 'Close' }).click()
  })
})
