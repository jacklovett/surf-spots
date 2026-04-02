import { test, expect, type Page } from '@playwright/test'
import { login } from './utils/auth-helper'
import {
  ensureManualLocation,
  fillLocationFromSelects,
  clickWizardContinue,
  fillPublicBasics,
  fillPrivateBasics,
} from './utils/addSurfSpotWizard'

const createdNamePrefix = 'E2E Private Spot'
const updatedName = 'E2E Updated Spot Name'

const STEP_LABELS = {
  basics: 'Basics',
  location: 'Location',
  type: 'Type',
  conditions: 'Conditions',
  amenities: 'Amenities',
} as const

function wizardProgressNav(page: Page) {
  return page.getByRole('navigation', { name: 'Form progress' })
}

function visibleContinueButton(page: Page) {
  return page.locator('button:has-text("Continue"):visible').first()
}

async function assertWizardCurrentStepLabel(page: Page, label: string) {
  const current = wizardProgressNav(page).locator('[aria-current="step"]')
  await expect(current).toBeVisible()
  await expect(current.locator('.surf-spot-wizard-stepper-node-label')).toHaveText(
    label,
  )
}

async function assertWizardStepIndex(page: Page, oneBasedStep: number) {
  await expect(wizardProgressNav(page)).toHaveAttribute(
    'aria-valuenow',
    String(oneBasedStep),
  )
}

/** Public wizard through Location to Type step (returns false if seed data missing). */
async function goPublicThroughLocationToTypeStep(
  page: Page,
  spotName: string,
): Promise<boolean> {
  await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })
  await fillPublicBasics(
    page,
    spotName,
    'E2E validation gate description',
  )
  await clickWizardContinue(page)
  const seeded = await fillLocationFromSelects(page)
  if (!seeded) return false
  await clickWizardContinue(page)
  await assertWizardCurrentStepLabel(page, STEP_LABELS.type)
  return true
}

/** Public non-novelty: through Type with ocean selects filled, stops on Conditions. */
async function goPublicToConditionsStep(
  page: Page,
  spotName: string,
): Promise<boolean> {
  const ok = await goPublicThroughLocationToTypeStep(page, spotName)
  if (!ok) return false
  await page.locator('select[name="type"]').selectOption({ index: 1 })
  await page.locator('select[name="beachBottomType"]').selectOption({ index: 1 })
  await page.locator('select[name="skillLevel"]').selectOption({ index: 1 })
  await page.locator('select[name="waveDirection"]').selectOption({ index: 1 })
  await clickWizardContinue(page)
  await assertWizardCurrentStepLabel(page, STEP_LABELS.conditions)
  return true
}

async function continueUntilSubmitVisible(page: Page) {
  const submitButton = page.locator('button[type="submit"]')
  for (let i = 0; i < 12; i++) {
    if (await submitButton.isVisible().catch(() => false)) break
    await clickWizardContinue(page)
  }
  await expect(submitButton).toBeVisible({ timeout: 15000 })
}

/** Public spot: every wizard step including Conditions; ends on Amenities with submit visible. */
async function walkFullPublicWizardToSubmit(page: Page, spotName: string) {
  await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })

  await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })
  await assertWizardStepIndex(page, 1)
  await assertWizardCurrentStepLabel(page, STEP_LABELS.basics)

  await fillPublicBasics(
    page,
    spotName,
    'E2E full wizard public description',
  )

  await clickWizardContinue(page)
  await assertWizardStepIndex(page, 2)
  await assertWizardCurrentStepLabel(page, STEP_LABELS.location)

  const seeded = await fillLocationFromSelects(page)
  if (!seeded) {
    return false
  }

  await clickWizardContinue(page)
  await assertWizardStepIndex(page, 3)
  await assertWizardCurrentStepLabel(page, STEP_LABELS.type)

  await page.locator('select[name="type"]').selectOption({ index: 1 })
  await page.locator('select[name="beachBottomType"]').selectOption({ index: 1 })
  await page.locator('select[name="skillLevel"]').selectOption({ index: 1 })
  await page.locator('select[name="waveDirection"]').selectOption({ index: 1 })

  await clickWizardContinue(page)
  await assertWizardStepIndex(page, 4)
  await assertWizardCurrentStepLabel(page, STEP_LABELS.conditions)

  const directionWrappers = page.locator('.direction-selector-wrapper')
  await directionWrappers
    .nth(0)
    .getByRole('button', { name: 'Select N direction' })
    .click()
  await directionWrappers
    .nth(1)
    .getByRole('button', { name: 'Select SW direction' })
    .click()

  await clickWizardContinue(page)
  await assertWizardStepIndex(page, 5)
  await assertWizardCurrentStepLabel(page, STEP_LABELS.amenities)

  await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 15000 })
  return true
}

async function createPrivateSurfSpotAndOpenDetails(page: Page) {
  await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })

  // Basics
  const nameInput = page.locator('input[name="name"]')
  await nameInput.waitFor({ state: 'visible', timeout: 15000 })
  const spotName = `${createdNamePrefix} ${Date.now()}`
  await fillPrivateBasics(page, spotName)

  // Location step defaults to map view; Enter Manually only exists here (not on Basics).
  await clickWizardContinue(page)
  const seeded = await fillLocationFromSelects(page)
  if (!seeded) {
    test.skip(
      true,
      'No seeded continent/country/region lookup data available for the e2e test',
    )
  }

  await continueUntilSubmitVisible(page)
  await page.locator('button[type="submit"]').click()

  // Success - Add mode should show the "View surf spot" button.
  const viewButton = page.getByRole('button', { name: /View surf spot/i })
  await viewButton.waitFor({ state: 'visible', timeout: 15000 })
  await viewButton.click()

  // Ensure we navigated via slug path (no id-based fallback)
  await expect(page.locator('h1')).toContainText(spotName)
  expect(page.url()).not.toContain('/surf-spots/id/')

  return { spotName }
}

test.describe('Surf Spot Wizard (Add/Edit Contract)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('stepper shows Basics first and Continue stays disabled until step is valid', async ({
    page,
  }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
    await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })

    const progress = wizardProgressNav(page)
    await expect(progress).toBeVisible()
    await expect(progress).toHaveAttribute('aria-valuenow', '1')
    await assertWizardCurrentStepLabel(page, STEP_LABELS.basics)

    const continueBtn = visibleContinueButton(page)
    await expect(continueBtn).toBeDisabled()

    // Public spot: use shared helper to enforce mode + required basics.
    await fillPublicBasics(
      page,
      'E2E Stepper Name',
      'E2E stepper description',
    )
    await expect(continueBtn).toBeEnabled()
  })

  test('public Basics: clearing description disables Continue and shows required error', async ({
    page,
  }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
    await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })

    await fillPublicBasics(
      page,
      'E2E Description Gate',
      'Will clear this',
    )
    const continueBtn = visibleContinueButton(page)
    await expect(continueBtn).toBeEnabled()

    await page.locator('textarea[name="description"]').fill('')
    await page.locator('textarea[name="description"]').blur()

    await expect(continueBtn).toBeDisabled({ timeout: 15000 })
    await expect(page.getByText('Description is required.')).toBeVisible({
      timeout: 15000,
    })
  })

  test('public Type step: Continue disabled until break type, beach, skill, and wave direction are set', async ({
    page,
  }) => {
    const ok = await goPublicThroughLocationToTypeStep(
      page,
      `E2E Type Gate ${Date.now()}`,
    )
    if (!ok) {
      test.skip(true, 'No seeded continent/country/region lookup data for e2e')
      return
    }

    const continueBtn = visibleContinueButton(page)
    await expect(continueBtn).toBeDisabled()

    await page.locator('select[name="type"]').selectOption({ index: 1 })
    await expect(continueBtn).toBeDisabled()
    await page.locator('select[name="beachBottomType"]').selectOption({ index: 1 })
    await expect(continueBtn).toBeDisabled()
    await page.locator('select[name="skillLevel"]').selectOption({ index: 1 })
    await expect(continueBtn).toBeDisabled()
    await page.locator('select[name="waveDirection"]').selectOption({ index: 1 })
    await expect(continueBtn).toBeEnabled({ timeout: 15000 })
  })

  test('public wavepool: Continue disabled until official website URL is valid', async ({
    page,
  }) => {
    const ok = await goPublicThroughLocationToTypeStep(
      page,
      `E2E Wavepool URL Gate ${Date.now()}`,
    )
    if (!ok) {
      test.skip(true, 'No seeded continent/country/region lookup data for e2e')
      return
    }

    const continueBtn = visibleContinueButton(page)
    await page.locator('input[name="isWavepool"] + .custom-checkbox').click()
    await expect(continueBtn).toBeDisabled({ timeout: 15000 })

    await page.locator('input[name="wavepoolUrl"]').fill('https://wavepool.example.com/e2e')
    await page.locator('input[name="wavepoolUrl"]').blur()
    await expect(continueBtn).toBeEnabled({ timeout: 15000 })
  })

  test('public Conditions step: Continue disabled until swell and wind directions are chosen', async ({
    page,
  }) => {
    const ok = await goPublicToConditionsStep(page, `E2E Conditions Gate ${Date.now()}`)
    if (!ok) {
      test.skip(true, 'No seeded continent/country/region lookup data for e2e')
      return
    }

    const continueBtn = visibleContinueButton(page)
    await expect(continueBtn).toBeDisabled()

    const directionWrappers = page.locator('.direction-selector-wrapper')
    await directionWrappers
      .nth(0)
      .getByRole('button', { name: 'Select N direction' })
      .click()
    await expect(continueBtn).toBeDisabled()

    await directionWrappers
      .nth(1)
      .getByRole('button', { name: 'Select SW direction' })
      .click()
    await expect(continueBtn).toBeEnabled({ timeout: 15000 })
  })

  test('Location step Continue stays disabled until location fields are complete', async ({
    page,
  }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
    await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })
    await fillPublicBasics(
      page,
      'E2E Location Gate',
      'E2E location gate description',
    )

    await clickWizardContinue(page)
    await ensureManualLocation(page)
    const continentVisible = await page
      .locator('select[name="continent"]')
      .isVisible({ timeout: 8000 })
      .catch(() => false)
    if (!continentVisible) {
      test.skip(true, 'No location selects visible for this environment')
      return
    }

    const continueBtn = visibleContinueButton(page)
    await expect(continueBtn).toBeDisabled()

    const ok = await fillLocationFromSelects(page)
    if (!ok) {
      test.skip(true, 'No seeded continent/country/region lookup data for e2e')
      return
    }

    await expect(continueBtn).toBeEnabled()
  })

  test('stepper advances to Location after Continue and Back returns to Basics', async ({
    page,
  }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
    const nameInput = page.locator('input[name="name"]')
    await nameInput.waitFor({ state: 'visible', timeout: 15000 })
    await fillPrivateBasics(page, `E2E Stepper Flow ${Date.now()}`)

    await clickWizardContinue(page)

    await ensureManualLocation(page)
    await expect(wizardProgressNav(page)).toHaveAttribute('aria-valuenow', '2')
    await assertWizardCurrentStepLabel(page, STEP_LABELS.location)

    await page.getByRole('button', { name: 'Back' }).click()
    await nameInput.waitFor({ state: 'visible', timeout: 10000 })
    await expect(wizardProgressNav(page)).toHaveAttribute('aria-valuenow', '1')
    await assertWizardCurrentStepLabel(page, STEP_LABELS.basics)
  })

  test('full public wizard visits every step in order to submit', async ({ page }) => {
    const spotName = `E2E Full Wizard ${Date.now()}`
    const ok = await walkFullPublicWizardToSubmit(page, spotName)
    if (!ok) {
      test.skip(true, 'No seeded continent/country/region lookup data for e2e')
      return
    }

    await page.locator('button[type="submit"]').click()

    const progress = wizardProgressNav(page)
    await expect(progress).toBeVisible({ timeout: 15000 })
    await expect(progress).toHaveAttribute('aria-valuemin', '1')
    await expect(progress).toHaveAttribute('aria-valuemax', '5')
    await expect(progress).toHaveAttribute('aria-valuenow', '5')
    await assertWizardCurrentStepLabel(page, 'Completed')

    await expect(page.locator('.surf-spot-form-success-message')).toBeVisible()
    await expect(page.getByRole('button', { name: /View surf spot/i })).toBeVisible()
  })

  test('wavepool path skips Conditions step and still requires core surf fields', async ({
    page,
  }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
    await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })

    const spotName = `E2E Wavepool Wizard ${Date.now()}`
    await fillPublicBasics(page, spotName, 'E2E wavepool path')

    await clickWizardContinue(page)
    const seeded = await fillLocationFromSelects(page)
    if (!seeded) {
      test.skip(true, 'No seeded continent/country/region lookup data for e2e')
      return
    }

    await clickWizardContinue(page)
    await assertWizardCurrentStepLabel(page, STEP_LABELS.type)

    await page.locator('input[name="isWavepool"] + .custom-checkbox').click()
    await page.locator('select[name="type"]').selectOption({ index: 1 })
    await page.locator('select[name="beachBottomType"]').selectOption({ index: 1 })
    await page.locator('select[name="skillLevel"]').selectOption({ index: 1 })
    await page.locator('select[name="waveDirection"]').selectOption({ index: 1 })
    await page.locator('input[name="wavepoolUrl"]').fill('https://wavepool.example.com/test')
    await page.locator('input[name="wavepoolUrl"]').blur()
    await expect(visibleContinueButton(page)).toBeEnabled({
      timeout: 15000,
    })

    await clickWizardContinue(page)
    await assertWizardStepIndex(page, 4)
    await assertWizardCurrentStepLabel(page, STEP_LABELS.amenities)

    await expect(page.getByText('Forecast Links', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Add Webcam Link/i })).toHaveCount(0)

    await expect(wizardProgressNav(page)).toHaveAttribute('aria-valuemax', '4')
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 15000 })
    await page.locator('button[type="submit"]').click()

    await expect(wizardProgressNav(page)).toHaveAttribute('aria-valuenow', '4')
    await assertWizardCurrentStepLabel(page, 'Completed')
    await expect(page.getByRole('button', { name: /View surf spot/i })).toBeVisible()
  })

  test('river wave skips Conditions step and requires break/skill/wave fields', async ({
    page,
  }) => {
    await page.goto('/add-surf-spot', { waitUntil: 'domcontentloaded' })
    await page.locator('input[name="name"]').waitFor({ state: 'visible', timeout: 15000 })

    const spotName = `E2E River Wave Wizard ${Date.now()}`
    await fillPublicBasics(page, spotName, 'E2E river wave novelty path')

    await clickWizardContinue(page)
    const seeded = await fillLocationFromSelects(page)
    if (!seeded) {
      test.skip(true, 'No seeded continent/country/region lookup data for e2e')
      return
    }

    await clickWizardContinue(page)
    await assertWizardCurrentStepLabel(page, STEP_LABELS.type)

    await page.locator('input[name="isRiverWave"] + .custom-checkbox').click()
    await expect(visibleContinueButton(page)).toBeDisabled({
      timeout: 15000,
    })
    await page.locator('select[name="type"]').selectOption({ index: 1 })
    await page.locator('select[name="beachBottomType"]').selectOption({ index: 1 })
    await page.locator('select[name="skillLevel"]').selectOption({ index: 1 })
    await page.locator('select[name="waveDirection"]').selectOption({ index: 1 })
    await expect(visibleContinueButton(page)).toBeEnabled({ timeout: 15000 })

    await clickWizardContinue(page)
    await assertWizardStepIndex(page, 4)
    await assertWizardCurrentStepLabel(page, STEP_LABELS.amenities)

    await expect(wizardProgressNav(page)).toHaveAttribute('aria-valuemax', '4')
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 15000 })
    await page.locator('button[type="submit"]').click()

    await expect(wizardProgressNav(page)).toHaveAttribute('aria-valuenow', '4')
    await assertWizardCurrentStepLabel(page, 'Completed')
    await expect(page.getByRole('button', { name: /View surf spot/i })).toBeVisible()
  })

  test('Add success navigates via slug path only', async ({ page }) => {
    const { spotName } = await createPrivateSurfSpotAndOpenDetails(page)

    expect(page.url()).toMatch(
      /\/surf-spots\/[^/]+\/[^/]+\/[^/]+(\/sub-regions\/[^/]+\/[^/]+)?\/[^/]+/,
    )
    await expect(page.locator('h1')).toContainText(spotName)
  })

  test('Edit success shows single button and navigates via updated slug path', async ({
    page,
  }) => {
    await createPrivateSurfSpotAndOpenDetails(page)

    const menuButton = page.locator('.spot-actions button[aria-label="Open menu"]').first()
    await menuButton.waitFor({ state: 'visible', timeout: 15000 })
    await menuButton.click()

    const editItem = page.getByRole('button', { name: 'Edit surf spot' })
    await editItem.waitFor({ state: 'visible', timeout: 10000 })
    await editItem.click()

    await expect(page.getByRole('heading', { name: /Edit Surf Spot/i })).toBeVisible({
      timeout: 15000,
    })

    const nameInput = page.locator('input[name="name"]')
    await nameInput.waitFor({ state: 'visible', timeout: 15000 })
    await nameInput.fill(updatedName)

    const submitButton = page.locator('button[type="submit"]')
    for (let i = 0; i < 10; i++) {
      if (await submitButton.isVisible().catch(() => false)) break
      await clickWizardContinue(page)
    }

    await expect(submitButton).toBeVisible({ timeout: 15000 })
    await submitButton.click()

    const successActions = page.locator('.surf-spot-form-success-actions')
    await expect(successActions).toBeVisible({ timeout: 15000 })
    await expect(successActions.locator('button')).toHaveCount(1)

    const seeUpdatedButton = page.getByRole('button', { name: /View spot/i })
    await seeUpdatedButton.waitFor({ state: 'visible', timeout: 15000 })
    await seeUpdatedButton.click()

    await page.waitForURL(
      /\/surf-spots\/[^/]+\/[^/]+\/[^/]+(\/sub-regions\/[^/]+\/[^/]+)?\/[^/]+/,
      { timeout: 20000 },
    )
    expect(page.url()).not.toContain('/surf-spots/id/')
    await expect(page.locator('h1')).toContainText(updatedName)
  })
})
