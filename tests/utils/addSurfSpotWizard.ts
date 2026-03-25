import { expect, type Page } from '@playwright/test'

/** Location step: switch from map to manual selects when the toggle is shown. */
export const ensureManualLocation = async (page: Page) => {
  const enterManually = page.getByText('Enter Manually')
  if (await enterManually.isVisible().catch(() => false)) {
    await enterManually.click()
  }
}

/** Returns false if seeded continent/country/region data is missing. */
export const fillLocationFromSelects = async (
  page: Page,
): Promise<boolean> => {
  await ensureManualLocation(page)

  const continentSelect = page.locator('select[name="continent"]')
  await continentSelect.waitFor({ state: 'visible', timeout: 15000 })

  const continentCount = await continentSelect.locator('option').count()
  if (continentCount <= 1) {
    return false
  }

  await continentSelect.selectOption({ index: 1 })

  const countrySelect = page.locator('select[name="country"]')
  await expect(countrySelect).toBeEnabled({ timeout: 15000 })
  await expect
    .poll(async () => countrySelect.locator('option').count(), {
      timeout: 15000,
    })
    .toBeGreaterThan(1)

  await countrySelect.selectOption({ index: 1 })

  const regionSelect = page.locator('select[name="region"]')
  await expect(regionSelect).toBeEnabled({ timeout: 15000 })
  await expect
    .poll(async () => regionSelect.locator('option').count(), {
      timeout: 15000,
    })
    .toBeGreaterThan(1)

  await regionSelect.selectOption({ index: 1 })

  await page.locator('input[name="longitude"]').fill('-9.5')
  await page.locator('input[name="latitude"]').fill('53.2')
  await page.locator('input[name="longitude"]').blur()
  await page.locator('input[name="latitude"]').blur()

  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({
    timeout: 15000,
  })
  return true
}

export const clickPrivateCheckboxIfNeeded = async (page: Page) => {
  const privateInput = page.locator('input[name="isPrivate"]')
  if (!(await privateInput.isChecked().catch(() => false))) {
    await privateInput.click()
    await expect(privateInput).toBeChecked({ timeout: 15000 })
  }
}

const setPrivateCheckbox = async (page: Page, shouldBePrivate: boolean) => {
  const privateInput = page.locator('input[name="isPrivate"]')
  const privateToggle = page.locator('input[name="isPrivate"] + .custom-checkbox')
  await privateInput.waitFor({ state: 'visible', timeout: 15000 })
  await privateToggle.waitFor({ state: 'visible', timeout: 15000 })

  const currentlyPrivate = await privateInput.isChecked().catch(() => false)
  if (currentlyPrivate !== shouldBePrivate) {
    await privateToggle.click()
    if (shouldBePrivate) {
      await expect(privateInput).toBeChecked({ timeout: 15000 })
    } else {
      await expect(privateInput).not.toBeChecked({ timeout: 15000 })
    }
  }
}

export const clickWizardContinue = async (page: Page) => {
  const btn = page.getByRole('button', { name: 'Continue' })
  await expect(btn).toBeEnabled({ timeout: 15000 })
  await btn.click()
}

export const fillPublicBasics = async (
  page: Page,
  name: string,
  description: string,
) => {
  // Explicitly enforce "public" mode so required fields match expectations.
  await setPrivateCheckbox(page, false)

  const nameInput = page.locator('input[name="name"]')
  const descriptionInput = page.locator('textarea[name="description"]')

  await nameInput.fill(name)
  await expect(nameInput).toHaveValue(name, { timeout: 15000 })
  await nameInput.blur()

  await descriptionInput.fill(description)
  await expect(descriptionInput).toHaveValue(description, { timeout: 15000 })
  await descriptionInput.blur()

  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({
    timeout: 15000,
  })
}

export const fillPrivateBasics = async (page: Page, name: string) => {
  // Ensure "private" mode so only name is required on Basics.
  await setPrivateCheckbox(page, true)

  const nameInput = page.locator('input[name="name"]')
  await nameInput.fill(name)
  await expect(nameInput).toHaveValue(name, { timeout: 15000 })
  await nameInput.blur()

  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({
    timeout: 15000,
  })
}

/**
 * Leave add-surf-spot on the Location step (after Basics).
 * "Enter Manually" / map only exist here — not on step 1.
 */
export const goToAddSurfSpotLocationStep = async (
  page: Page,
  opts: { mode: 'public' | 'private'; name: string; description?: string },
) => {
  await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })
  if (opts.mode === 'public') {
    await fillPublicBasics(page, opts.name, opts.description ?? 'E2E description')
  } else {
    await fillPrivateBasics(page, opts.name)
  }
  await clickWizardContinue(page)
  await page.getByRole('heading', { name: /Set Location/i }).waitFor({
    state: 'visible',
    timeout: 15000,
  })
}

/**
 * Private spot → Amenities step (webcams / forecasts live here).
 * false = missing seed location data (caller should skip).
 */
export const goToAddSurfSpotAmenitiesStep = async (
  page: Page,
  spotName = 'E2E Webcams',
): Promise<boolean> => {
  await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })
  await fillPrivateBasics(page, spotName)
  await clickWizardContinue(page)
  const ok = await fillLocationFromSelects(page)
  if (!ok) return false

  // Steps (private, non-novelty wavepool): Basics -> Location -> Type -> Amenities
  // We stop on Amenities so webcam/forecast inputs are visible.
  await clickWizardContinue(page) // Location -> Type
  await clickWizardContinue(page) // Type -> Amenities

  await expect(page.getByRole('heading', { name: /Amenities/i })).toBeVisible({
    timeout: 15000,
  })
  return true
}
