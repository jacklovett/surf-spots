import { test, expect } from '@playwright/test'
import { login } from './utils/auth-helper'

test.describe('Profile - emergency contact', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show emergency contact section', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible({
      timeout: 15000,
    })
    const section = page.getByTestId('profile-emergency-contact')
    await expect(section).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Emergency contact' })).toBeVisible()
    await expect(page.getByTestId('emergency-contact-phone-field')).toBeVisible()
  })

  test('should open country list from custom country control', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await page.getByTestId('emergency-contact-phone-field').waitFor({
      state: 'visible',
      timeout: 15000,
    })

    await page.getByTestId('emergency-contact-country-trigger').click()
    const list = page.getByTestId('emergency-contact-country-list')
    await expect(list).toBeVisible()
    await expect(
      list.getByRole('option', { name: /United States/i }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('emergency-contact-country-trigger')).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  test('should filter country list by name or dial code', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await page.getByTestId('emergency-contact-phone-field').waitFor({
      state: 'visible',
      timeout: 15000,
    })

    await page.getByTestId('emergency-contact-country-trigger').click()
    const list = page.getByTestId('emergency-contact-country-list')
    const search = page.getByTestId('emergency-contact-country-search')
    await expect(search).toBeFocused()
    await expect(search).toHaveAttribute('role', 'combobox')
    await expect(search).toHaveAttribute('aria-autocomplete', 'list')

    await search.fill('united kingdom')
    await expect(
      list.getByRole('option', { name: /United Kingdom/i }),
    ).toBeVisible()
    await expect(
      list.getByRole('option', { name: /United States/i }),
    ).toHaveCount(0)

    await search.fill('61')
    await expect(
      list.getByRole('option', { name: /Australia/i }),
    ).toBeVisible()
  })

  test('should select country with keyboard from combobox', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await page.getByTestId('emergency-contact-phone-field').waitFor({
      state: 'visible',
      timeout: 15000,
    })

    const trigger = page.getByTestId('emergency-contact-country-trigger')
    await trigger.click()
    const search = page.getByTestId('emergency-contact-country-search')
    await expect(search).toBeFocused()

    await search.fill('portugal')
    await page.keyboard.press('ArrowDown')
    const portugalOption = page.getByRole('option', { name: /Portugal/i })
    await expect(portugalOption).toHaveAttribute('aria-selected', 'true')
    const portugalOptionId = await portugalOption.getAttribute('id')
    expect(portugalOptionId).toBeTruthy()
    await expect(search).toHaveAttribute(
      'aria-activedescendant',
      portugalOptionId as string,
    )

    await page.keyboard.press('Enter')
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toContainText('+351')
  })

  test('should save emergency contact and show success', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await page.getByTestId('profile-emergency-contact').waitFor({
      state: 'visible',
      timeout: 15000,
    })

    const uniqueName = `E2E Emergency ${Date.now()}`
    await page.locator('input[name="emergencyContactName"]').fill(uniqueName)
    await page
      .locator('select[name="emergencyContactRelationship"]')
      .selectOption({ label: 'Friend' })

    const phoneInput = page.locator('#emergencyContactPhone-input')
    await phoneInput.fill('2025550123')

    const saveButton = page.getByRole('button', { name: 'Save Changes' })
    await expect(saveButton).toBeEnabled({ timeout: 10000 })
    await saveButton.click()

    await expect(
      page.locator('.toast--success .toast-message').filter({ hasText: /Profile updated/i }),
    ).toBeVisible({ timeout: 20000 })
  })
})
