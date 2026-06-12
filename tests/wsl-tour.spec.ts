import { test, expect } from '@playwright/test'
import { getVisibleDrawerOrNull } from './utils/drawer'

const openFiltersDrawer = async (page: import('@playwright/test').Page) => {
  const filtersButton = page.locator('.toolbar button').first()
  await expect(filtersButton).toBeVisible()
  await filtersButton.click()
  const filtersDrawer = await getVisibleDrawerOrNull(page)
  expect(filtersDrawer).not.toBeNull()
  return filtersDrawer!
}

test.describe('WSL Championship Tour', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/surf-spots')
    await page.waitForSelector('.map-container', { state: 'visible', timeout: 15000 })
  })

  test('should show WSL Championship Tour filter under novelty waves', async ({ page }) => {
    const filtersDrawer = await openFiltersDrawer(page)

    const wslFilter = filtersDrawer.getByRole('checkbox', {
      name: /WSL Championship Tour/i,
    })
    await expect(wslFilter).toBeVisible()
    await expect(wslFilter).not.toBeChecked()
    await expect(
      filtersDrawer.getByText('Championship Tour venues — past stops and this season'),
    ).toBeVisible()
  })

  test('should apply WSL Championship Tour filter without breaking surf spots view', async ({
    page,
  }) => {
    const filtersDrawer = await openFiltersDrawer(page)

    const wslFilter = filtersDrawer.getByRole('checkbox', {
      name: /WSL Championship Tour/i,
    })
    await wslFilter.check()
    await expect(wslFilter).toBeChecked()

    await filtersDrawer.getByRole('button', { name: 'Apply Filters' }).click()

    await expect(page.locator('.map-container')).toBeVisible()
    await expect(page).toHaveURL(/\/surf-spots/)
  })

  test('should clear WSL Championship Tour filter with clear all', async ({ page }) => {
    const filtersDrawer = await openFiltersDrawer(page)

    const wslFilter = filtersDrawer.getByRole('checkbox', {
      name: /WSL Championship Tour/i,
    })
    await wslFilter.check()
    await filtersDrawer.getByRole('button', { name: 'Clear All' }).click()
    await expect(wslFilter).not.toBeChecked()
  })
})
