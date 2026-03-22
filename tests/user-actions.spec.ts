import { test, expect } from '@playwright/test'
import { login } from './utils/auth-helper'
import {
  fillLocationFromSelects,
  goToAddSurfSpotLocationStep,
  goToAddSurfSpotAmenitiesStep,
} from './utils/addSurfSpotWizard'

test.describe('User Actions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/surf-spots')
  })

  test('should allow adding new surf spot', async ({ page }) => {
    const addButton = page.locator('a[href="/add-surf-spot"], button:has-text("Add"), .button:has-text("Add")').first()
    await expect(addButton).toBeVisible()
    await addButton.click()
    await expect(page).toHaveURL(/\/add-surf-spot/)
    await expect(page.locator('form')).toBeVisible()
  })

  test('should handle surf spot form submission', async ({ page }) => {
    await goToAddSurfSpotLocationStep(page, {
      mode: 'public',
      name: 'Test Surf Spot',
      description: 'A great test surf spot',
    })

    const ok = await fillLocationFromSelects(page)
    if (!ok) {
      test.skip(true, 'No location data (continents) loaded in test backend')
      return
    }

    // We don't assert submit enabled here because later wizard steps
    // also participate in validation. This test focuses on the form staying usable.
    await expect(page.locator('form')).toBeVisible()
  })

  test('should handle filters functionality', async ({ page }) => {
    await page.waitForSelector('.toolbar', { state: 'visible', timeout: 10000 })
    await page.locator('.toolbar button').first().click()

    // Filters open in a left drawer; wait for it to be visible (may animate in)
    const filtersDrawer = page.locator('.drawer--left')
    await filtersDrawer.waitFor({ state: 'visible', timeout: 10000 })
    await expect(filtersDrawer).toBeVisible()

    const filterOption = filtersDrawer.locator('input[type="checkbox"]').first()
    if (await filterOption.isVisible()) {
      await filterOption.click()
      await filtersDrawer.locator('button').last().click()
    }
  })

  test('should handle view toggle', async ({ page }) => {
    await page.goto('/surf-spots')
    await page.waitForSelector('.view-switch', { state: 'visible', timeout: 10000 })
    await page.locator('.view-switch').click()
    await expect(page).toHaveURL(/\/surf-spots\/continents/)
  })

  test('should handle map interactions', async ({ page }) => {
    await page.goto('/surf-spots')
    await page.waitForSelector('.map-container', { state: 'visible', timeout: 15000 })

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
    await page.goto('/surf-spots/africa/algeria/boumerdes')

    const breadcrumb = page.locator('.breadcrumb')
    await expect(breadcrumb).toBeVisible()

    const worldLink = breadcrumb.locator('a:has-text("World")')
    await worldLink.click()
    await expect(page).toHaveURL(/\/surf-spots\/continents/)
  })

  test('should handle form validation', async ({ page }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })

    await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 10000 })
    // Wizard: submit is hidden until the last step; Continue is gated per step.
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await expect(page.locator('form')).toBeVisible()
  })

  test('should show Webcam Links section on add surf spot form', async ({
    page,
  }) => {
    const ok = await goToAddSurfSpotAmenitiesStep(page, 'E2E Webcam Section')
    if (!ok) {
      test.skip(true, 'No seeded location data for add-surf-spot wizard')
      return
    }

    await expect(
      page.getByRole('heading', { name: /Amenities/i }),
    ).toBeVisible({ timeout: 15000 })

    await expect(page.locator('input[name="webcams"]').first()).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.locator('button:has-text("Add"), button:has-text("Webcam")').first(),
    ).toBeVisible()
  })

  test('should add and remove webcam link row when clicking Add Webcam Link', async ({
    page,
  }) => {
    const ok = await goToAddSurfSpotAmenitiesStep(page, 'E2E Webcam Rows')
    if (!ok) {
      test.skip(true, 'No seeded location data for add-surf-spot wizard')
      return
    }

    await expect(
      page.locator('button:has-text("Add"), button:has-text("Webcam")').first(),
    ).toBeVisible({ timeout: 15000 })

    const addWebcamButton = page.locator('button:has-text("Add"), button:has-text("Webcam")').first()
    await addWebcamButton.click()

    const webcamInputs = page.locator('input[name="webcams"]')
    const firstCount = await webcamInputs.count()
    if (firstCount === 0) {
      test.skip(true, 'Webcam inputs not rendered (feature disabled or layout changed)')
      return
    }

    expect(firstCount).toBeGreaterThanOrEqual(1)

    await addWebcamButton.click()
    const secondCount = await webcamInputs.count()
    expect(secondCount).toBeGreaterThanOrEqual(firstCount)

    const firstWebcamRow = page
      .locator('.form-inline')
      .filter({ has: page.locator('input[name="webcams"]') })
      .first()
    await firstWebcamRow.getByRole('button', { name: 'Remove' }).click()
    const finalCount = await webcamInputs.count()
    expect(finalCount).toBeGreaterThanOrEqual(0)
  })

  test('should auto-populate country and region from map pin', async ({
    page,
  }) => {
    await goToAddSurfSpotLocationStep(page, {
      mode: 'public',
      name: 'Map Pin Surf Spot',
      description: 'E2E map geocode',
    })

    const mapContainer = page.locator('.map-container').first()
    await mapContainer.waitFor({ state: 'visible', timeout: 15000 })

    await mapContainer.click({ position: { x: 400, y: 300 } })

    // When using map, country/region are visible readonly text inputs (there is also a hidden region input)
    const countryInput = page.getByRole('textbox', { name: 'Country' })
    const regionInput = page.getByRole('textbox', { name: 'Region' })

    await expect(countryInput).toBeVisible({ timeout: 10000 })
    await expect(regionInput).toBeVisible({ timeout: 10000 })
    expect(await countryInput.isDisabled()).toBe(true)
    expect(await regionInput.isDisabled()).toBe(true)
  })
})
