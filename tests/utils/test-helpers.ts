import { Page, expect } from '@playwright/test'

/**
 * Wait for page to be ready for interaction.
 * Uses 'load' instead of 'networkidle' so pages with maps/analytics/long-lived
 * connections don't time out (networkidle is flaky on SPAs).
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('load', { timeout: 30000 })
  await page.waitForTimeout(1000) // Brief buffer for hydration
}

/**
 * Check if element is visible and wait for it
 */
export async function isElementVisible(
  page: Page,
  selector: string,
  timeout = 15000,
) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout })
    return true
  } catch {
    return false
  }
}

/**
 * Click element if visible
 */
export async function clickIfVisible(page: Page, selector: string) {
  if (await isElementVisible(page, selector)) {
    await page.click(selector)
    return true
  }
  return false
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingComplete(page: Page) {
  // Wait for loading indicators to disappear
  await page.waitForFunction(
    () => {
      const loadingElements = document.querySelectorAll(
        '.loading, .skeleton-loader',
      )
      return loadingElements.length === 0
    },
    { timeout: 20000 },
  )

  // Additional wait for slower machines
  await page.waitForTimeout(1000)
}

/**
 * Check for errors on the page
 * Includes both inline error messages and toast notifications
 */
export async function checkForErrors(page: Page) {
  const errorElements = page.locator(
    '.error-message, .error-boundary, .submit-status, .toast--error[role="alert"]',
  )
  const errorCount = await errorElements.count()

  if (errorCount > 0) {
    const errorTexts = await errorElements.allTextContents()
    console.log('Errors found:', errorTexts)
  }

  return errorCount === 0
}

/**
 * Take screenshot for debugging
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
}

/**
 * Wait for map to load
 */
export async function waitForMapLoad(page: Page) {
  // Wait for map container to be visible - map container is rendered directly when in map view
  await page.waitForSelector('.map-container', {
    state: 'visible',
    timeout: 20000,
  })

  // Wait for mapbox elements to load
  await page.waitForSelector('.mapboxgl-canvas', {
    state: 'visible',
    timeout: 20000,
  })

  // Additional wait for map to be fully interactive
  await page.waitForTimeout(3000)
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page) {
  // Check for user-specific elements that indicate authentication
  const userElements = page.locator(
    '.user-menu, .profile-link, [data-testid="user-menu"]',
  )
  return await userElements.isVisible()
}

/**
 * Navigate to a page and wait for it to load
 */
export async function navigateTo(page: Page, url: string) {
  await page.goto(url)
  await waitForPageLoad(page)
  await waitForLoadingComplete(page)
}

/**
 * Assert no errors are present
 */
export async function assertNoErrors(page: Page) {
  const hasErrors = await checkForErrors(page)
  expect(hasErrors).toBe(true)
}

/**
 * Wait for URL to match pattern
 */
export async function waitForURL(page: Page, pattern: RegExp, timeout = 20000) {
  await page.waitForURL(pattern, { timeout })
}

/**
 * Fill form field safely
 */
export async function fillFormField(page: Page, name: string, value: string) {
  const field = page.locator(`input[name="${name}"], textarea[name="${name}"]`)
  if (await field.isVisible()) {
    await field.fill(value)
    return true
  }
  return false
}

/**
 * Submit form safely - waits for button to be enabled before clicking
 */
export async function submitForm(page: Page) {
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.waitFor({ state: 'visible' })
  await expect(submitButton).toBeEnabled({ timeout: 5000 })
  await submitButton.click()
  return true
}

/**
 * Check if element contains text
 */
export async function elementContainsText(
  page: Page,
  selector: string,
  text: string,
) {
  const element = page.locator(selector)
  if (await element.isVisible()) {
    const elementText = await element.textContent()
    return elementText?.includes(text) || false
  }
  return false
}

/**
 * Wait for element to be hidden
 */
export async function waitForElementHidden(
  page: Page,
  selector: string,
  timeout = 10000,
) {
  await page.waitForSelector(selector, { state: 'hidden', timeout })
}

/**
 * Get element count
 */
export async function getElementCount(page: Page, selector: string) {
  const elements = page.locator(selector)
  return await elements.count()
}

/**
 * Assert element count
 */
export async function assertElementCount(
  page: Page,
  selector: string,
  expectedCount: number,
) {
  const count = await getElementCount(page, selector)
  expect(count).toBe(expectedCount)
}

/**
 * Wait for element with retry logic
 */
export async function waitForElementWithRetry(
  page: Page,
  selector: string,
  maxRetries = 3,
  timeout = 10000,
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout })
      return true
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await page.waitForTimeout(1000)
    }
  }
  return false
}

/**
 * Wait for network idle with longer timeout
 */
export async function waitForNetworkIdle(page: Page, timeout = 30000) {
  await page.waitForLoadState('networkidle', { timeout })
}
