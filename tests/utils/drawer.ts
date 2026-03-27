import { expect, type Locator, type Page } from '@playwright/test'

const DRAWER_SELECTOR = '.drawer--left, .drawer--open, .drawer'

export const getDrawer = (page: Page): Locator =>
  page.locator(DRAWER_SELECTOR).first()

export const waitForDrawerVisible = async (
  page: Page,
  timeout = 10000,
): Promise<Locator> => {
  const drawer = getDrawer(page)
  await expect(drawer).toBeVisible({ timeout })
  return drawer
}

export const getVisibleDrawerOrNull = async (
  page: Page,
  timeout = 10000,
): Promise<Locator | null> => {
  const drawer = getDrawer(page)
  const visible = await drawer.isVisible({ timeout }).catch(() => false)
  return visible ? drawer : null
}
