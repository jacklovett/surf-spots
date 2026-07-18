import { describe, expect, it } from 'vitest'

import {
  validateDirection,
  validateEmail,
  validateLatitude,
  validateLongitude,
  validatePassword,
  validateUrl,
} from './index'

describe('validateEmail', () => {
  it('should require an @', () => {
    expect(validateEmail('')).toContain('required')
    expect(validateEmail('not-an-email')).toContain('valid')
    expect(validateEmail('user@example.com')).toBe('')
  })
})

describe('validatePassword', () => {
  it('should enforce length and category rules', () => {
    expect(validatePassword('short')).toContain('at least 8')
    expect(validatePassword('alllowercase1')).toContain('three of the following')
    expect(validatePassword('GoodPass1')).toBe('')
  })
})

describe('validateDirection', () => {
  it('should accept single points and hyphen ranges', () => {
    expect(validateDirection('')).toBe('')
    expect(validateDirection('NW')).toBe('')
    expect(validateDirection('NW-S')).toBe('')
    expect(validateDirection('north')).toContain('valid')
  })
})

describe('validateLongitude / validateLatitude', () => {
  it('should require values and enforce ranges', () => {
    expect(validateLongitude(undefined)).toContain('required')
    expect(validateLongitude(-181)).toContain('valid')
    expect(validateLongitude(-9.2)).toBe('')
    expect(validateLatitude(91)).toContain('valid')
    expect(validateLatitude(38.6)).toBe('')
  })
})

describe('validateUrl', () => {
  it('should accept http(s) URLs and reject unsafe schemes', () => {
    expect(validateUrl('https://example.com')).toBe('')
    expect(validateUrl('javascript:alert(1)')).toContain('valid')
  })
})
