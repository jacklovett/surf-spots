import { describe, expect, it } from 'vitest'

import {
  getSafeFetcherErrorMessage,
  httpStatusFromActionError,
  messageForDisplay,
  toSafeMessage,
} from './errorUtils'

describe('messageForDisplay', () => {
  it('should return user-facing text and block internal details', () => {
    expect(messageForDisplay('Unable to save session', 'fallback')).toBe(
      'Unable to save session',
    )
    expect(
      messageForDisplay('Cannot read properties of undefined', 'fallback'),
    ).toBe('fallback')
    expect(messageForDisplay('fetch failed', 'fallback')).toBe('fallback')
    expect(messageForDisplay('', 'fallback')).toBe('fallback')
  })
})

describe('toSafeMessage', () => {
  it('should allow listed messages and fall back otherwise', () => {
    const allowed = new Set(['Known failure'])
    expect(toSafeMessage(new Error('Known failure'), allowed, 'fallback')).toBe(
      'Known failure',
    )
    expect(
      toSafeMessage(new Error('Hibernate Exception boom'), allowed, 'fallback'),
    ).toBe('fallback')
    expect(toSafeMessage('not-an-error', allowed, 'fallback')).toBe('fallback')
  })
})

describe('httpStatusFromActionError', () => {
  it('should forward 4xx/5xx and default to 500', () => {
    expect(httpStatusFromActionError({ status: 404 })).toBe(404)
    expect(httpStatusFromActionError({ status: 200 })).toBe(500)
    expect(httpStatusFromActionError(new Error('x'))).toBe(500)
  })
})

describe('getSafeFetcherErrorMessage', () => {
  it('should prefer error then submitStatus through the safety filter', () => {
    expect(
      getSafeFetcherErrorMessage(
        { error: 'Spot name is required', hasError: true },
        'fallback',
      ),
    ).toBe('Spot name is required')
    expect(
      getSafeFetcherErrorMessage(
        { submitStatus: 'Cannot read property foo', hasError: true },
        'fallback',
      ),
    ).toBe('fallback')
    expect(getSafeFetcherErrorMessage(null, 'fallback')).toBe('fallback')
  })
})
