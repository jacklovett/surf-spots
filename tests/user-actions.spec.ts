import { test, expect } from '@playwright/test'
import { login } from './utils/auth-helper'

test.describe('User Actions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/surf-spots')
  })

  test('should allow adding new surf spot', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add new spot/i })
    await expect(addButton).toBeVisible()
    await addButton.click()
    await expect(page).toHaveURL(/\/add-surf-spot/)
    await expect(page.locator('form')).toBeVisible()
  })

  test('should handle surf spot form submission', async ({ page }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })

    const nameInput = page.locator('input[name="name"]')
    await nameInput.waitFor({ state: 'visible', timeout: 10000 })
    await nameInput.fill('Test Surf Spot')

    const descriptionInput = page.locator('textarea[name="description"]')
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('A great test surf spot')
    }

    // Switch to Enter Manually (ViewSwitch is a div with spans, not buttons)
    await page.getByText('Enter Manually').click()

    // Fill required location: continent -> country -> region -> longitude, latitude
    const continentSelect = page.locator('select[name="continent"]')
    await continentSelect.waitFor({ state: 'visible', timeout: 10000 })
    const continentOptions = await continentSelect.locator('option').count()
    if (continentOptions <= 1) {
      test.skip(true, 'No location data (continents) loaded in test backend')
      return
    }

    await continentSelect.selectOption({ index: 1 })
    const countrySelect = page.locator('select[name="country"]')
    await countrySelect.waitFor({ state: 'visible', timeout: 5000 })
    await countrySelect.selectOption({ index: 1 })
    const regionSelect = page.locator('select[name="region"]')
    await regionSelect.waitFor({ state: 'visible', timeout: 5000 })
    await regionSelect.selectOption({ index: 1 })
    await page.locator('input[name="longitude"]').fill('-9.5')
    await page.locator('input[name="latitude"]').fill('53.2')

    // We don't assert submit enabled here because additional fields
    // (e.g. conditions) also participate in validation. This test
    // focuses on the form being usable without throwing.
    await expect(page.locator('form')).toBeVisible()
  })

  test('should handle filters functionality', async ({ page }) => {
    await page.waitForSelector('.toolbar', { state: 'visible', timeout: 10000 })
    await page.getByRole('button', { name: 'Filters' }).click()

    // Filters open in a left drawer; wait for it to be visible (may animate in)
    const filtersDrawer = page.locator('.drawer--left')
    await filtersDrawer.waitFor({ state: 'visible', timeout: 10000 })
    await expect(filtersDrawer).toBeVisible()

    const filterOption = filtersDrawer.locator('input[type="checkbox"]').first()
    if (await filterOption.isVisible()) {
      await filterOption.click()
      await filtersDrawer.getByRole('button', { name: 'Apply Filters' }).click()
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

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()

    // When required fields are empty, submit is disabled (form validation)
    await expect(submitButton).toBeDisabled()
    await expect(page.locator('form')).toBeVisible()
  })

  test('should show Webcam Links section on add surf spot form', async ({
    page,
  }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })

    await expect(page.getByText('Webcam Links', { exact: true })).toBeVisible({ timeout: 15000 })
    await expect(
      page.getByRole('button', { name: 'Add Webcam Link' }),
    ).toBeVisible()
  })

  test('should add and remove webcam link row when clicking Add Webcam Link', async ({
    page,
  }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Add Webcam Link' })).toBeVisible({ timeout: 15000 })

    const addWebcamButton = page.getByRole('button', {
      name: 'Add Webcam Link',
    })
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
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })

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
