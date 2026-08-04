import type { ConsoleMessage, Page } from '@playwright/test'
import { expect } from '@playwright/test'

const isHydrationNoise = (text: string) =>
  text.includes('Hydration') ||
  text.includes('hydration') ||
  text.includes('server HTML') ||
  text.includes('did not match')

/**
 * Call before navigation. After the page settles, call `assertNone()`.
 */
export const expectNoHydrationNoise = (page: Page) => {
  const noise: string[] = []

  const onConsole = (message: ConsoleMessage) => {
    if (message.type() !== 'error' && message.type() !== 'warning') {
      return
    }
    const text = message.text()
    if (isHydrationNoise(text)) {
      noise.push(text)
    }
  }

  page.on('console', onConsole)

  return {
    assertNone: (detail?: string) => {
      page.off('console', onConsole)
      expect(
        noise,
        detail ??
          `Unexpected hydration console noise:\n${noise.join('\n')}`,
      ).toEqual([])
    },
  }
}
