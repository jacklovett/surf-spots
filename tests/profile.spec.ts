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

    await expect(page.locator('.form-success')).toContainText(/Profile updated/i, {
      timeout: 20000,
    })
  })
})
