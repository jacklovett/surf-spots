import { describe, expect, it } from 'vitest'

import {
  isValidHttpUrl,
  normalizeUserUrl,
  resolveNotificationLink,
  safeLinkHref,
} from './commonUtils'

describe('safeLinkHref', () => {
  it('should allow http(s) and reject dangerous schemes', () => {
    expect(safeLinkHref('https://example.com/path')).toBe(
      'https://example.com/path',
    )
    expect(safeLinkHref('http://example.com')).toBe('http://example.com')
    expect(safeLinkHref('javascript:alert(1)')).toBeNull()
    expect(safeLinkHref('data:text/html,hi')).toBeNull()
    expect(safeLinkHref('')).toBeNull()
    expect(safeLinkHref(null)).toBeNull()
  })
})

describe('normalizeUserUrl', () => {
  it('should add https when scheme is missing', () => {
    expect(normalizeUserUrl('example.com/cam')).toBe(
      'https://example.com/cam',
    )
  })

  it('should lowercase protocol and host', () => {
    expect(normalizeUserUrl('HTTPS://Example.COM/Path')).toBe(
      'https://example.com/Path',
    )
  })
})

describe('isValidHttpUrl', () => {
  it('should treat empty as valid optional URL', () => {
    expect(isValidHttpUrl('')).toBe(true)
  })

  it('should accept normalized hosts and reject junk', () => {
    expect(isValidHttpUrl('magicseaweed.com')).toBe(true)
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('resolveNotificationLink', () => {
  it('should treat app paths as internal and http(s) as external', () => {
    expect(resolveNotificationLink('/surf-spots/africa/algeria')).toEqual({
      externalHref: null,
      internalPath: '/surf-spots/africa/algeria',
    })
    expect(resolveNotificationLink('https://example.com')).toEqual({
      externalHref: 'https://example.com',
      internalPath: null,
    })
    expect(resolveNotificationLink('//evil.example')).toEqual({
      externalHref: null,
      internalPath: null,
    })
  })
})
